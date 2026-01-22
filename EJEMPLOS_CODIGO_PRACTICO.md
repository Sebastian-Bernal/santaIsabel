# Ejemplos de Código Práctico - Implementación

**Código listo para usar e implementar en la arquitectura propuesta**

---

## 1️⃣ HttpClient Centralizado

```typescript
// src/infrastructure/http/HttpClient.ts
export interface HttpClientOptions {
    baseUrl: string;
    timeout?: number;
    headers?: Record<string, string>;
    interceptors?: {
        request?: (config: RequestInit) => RequestInit;
        response?: (response: Response) => Response | Promise<Response>;
        error?: (error: Error) => Error;
    };
}

export class HttpError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        message: string,
        public data?: any
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

export class HttpClient {
    private baseUrl: string;
    private timeout: number;
    private headers: Record<string, string>;
    private interceptors: HttpClientOptions['interceptors'];
    
    constructor(options: HttpClientOptions) {
        this.baseUrl = options.baseUrl;
        this.timeout = options.timeout || 10000;
        this.headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        this.interceptors = options.interceptors || {};
    }
    
    async request<T = any>(
        method: string,
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        const fullUrl = this.buildUrl(url);
        
        let config: RequestInit = {
            method,
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout),
            ...options
        };
        
        // Aplicar interceptor de request
        if (this.interceptors.request) {
            config = this.interceptors.request(config);
        }
        
        try {
            let response = await fetch(fullUrl, config);
            
            // Aplicar interceptor de response
            if (this.interceptors.response) {
                response = await this.interceptors.response(response);
            }
            
            // Manejar errores HTTP
            if (!response.ok) {
                const data = await this.parseResponse(response);
                throw new HttpError(
                    response.status,
                    response.statusText,
                    data?.message || response.statusText,
                    data
                );
            }
            
            // Parsear respuesta
            return await this.parseResponse(response);
        } catch (error) {
            // Aplicar interceptor de error
            if (this.interceptors.error) {
                throw this.interceptors.error(error as Error);
            }
            throw error;
        }
    }
    
    async get<T = any>(url: string, options?: RequestInit): Promise<T> {
        return this.request<T>('GET', url, options);
    }
    
    async post<T = any>(url: string, body?: any, options?: RequestInit): Promise<T> {
        return this.request<T>('POST', url, {
            body: JSON.stringify(body),
            ...options
        });
    }
    
    async put<T = any>(url: string, body?: any, options?: RequestInit): Promise<T> {
        return this.request<T>('PUT', url, {
            body: JSON.stringify(body),
            ...options
        });
    }
    
    async patch<T = any>(url: string, body?: any, options?: RequestInit): Promise<T> {
        return this.request<T>('PATCH', url, {
            body: JSON.stringify(body),
            ...options
        });
    }
    
    async delete<T = any>(url: string, options?: RequestInit): Promise<T> {
        return this.request<T>('DELETE', url, options);
    }
    
    private buildUrl(url: string): string {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `${this.baseUrl}/${url.replace(/^\//, '')}`;
    }
    
    private async parseResponse(response: Response): Promise<any> {
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
            return response.json();
        } else if (contentType?.includes('text')) {
            return response.text();
        } else if (contentType?.includes('blob')) {
            return response.blob();
        } else {
            return response;
        }
    }
    
    setHeader(key: string, value: string): void {
        this.headers[key] = value;
    }
    
    removeHeader(key: string): void {
        delete this.headers[key];
    }
    
    setBaseUrl(baseUrl: string): void {
        this.baseUrl = baseUrl;
    }
}

// Exportar instancia singleton
export const createHttpClient = (options: HttpClientOptions): HttpClient => {
    return new HttpClient(options);
};
```

---

## 2️⃣ Cache Manager Inteligente

```typescript
// src/infrastructure/cache/CacheManager.ts
export interface CacheEntry<T = any> {
    data: T;
    timestamp: number;
    ttl?: number;
}

export type CacheStrategy = 'CACHE_FIRST' | 'NETWORK_FIRST' | 'STALE_WHILE_REVALIDATE';

export class CacheManager {
    private memory: Map<string, CacheEntry> = new Map();
    private indexedDB: IDBDatabase | null = null;
    private dbName = 'santa-isabel-cache';
    private storeName = 'cache-store';
    
    constructor(private maxAge: number = 10 * 60 * 1000) {
        this.initializeIndexedDB();
    }
    
    private async initializeIndexedDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.indexedDB = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'key' });
                }
            };
        });
    }
    
    async get<T = any>(
        key: string,
        fetcher: () => Promise<T>,
        strategy: CacheStrategy = 'CACHE_FIRST'
    ): Promise<T> {
        switch (strategy) {
            case 'CACHE_FIRST':
                return this.cacheFirst<T>(key, fetcher);
            case 'NETWORK_FIRST':
                return this.networkFirst<T>(key, fetcher);
            case 'STALE_WHILE_REVALIDATE':
                return this.staleWhileRevalidate<T>(key, fetcher);
            default:
                return this.cacheFirst<T>(key, fetcher);
        }
    }
    
    private async cacheFirst<T>(
        key: string,
        fetcher: () => Promise<T>
    ): Promise<T> {
        // 1. Memoria (10ms)
        const memoryEntry = this.memory.get(key) as CacheEntry<T> | undefined;
        if (memoryEntry && !this.isExpired(memoryEntry)) {
            return memoryEntry.data;
        }
        
        // 2. IndexedDB (50-100ms)
        const idbEntry = await this.readFromIDB<T>(key);
        if (idbEntry && !this.isExpired(idbEntry)) {
            this.memory.set(key, idbEntry);
            return idbEntry.data;
        }
        
        // 3. Network
        const data = await fetcher();
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: this.maxAge
        };
        
        this.memory.set(key, entry);
        await this.writeToIDB(key, entry);
        
        return data;
    }
    
    private async networkFirst<T>(
        key: string,
        fetcher: () => Promise<T>
    ): Promise<T> {
        try {
            const data = await fetcher();
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                ttl: this.maxAge
            };
            
            this.memory.set(key, entry);
            await this.writeToIDB(key, entry);
            
            return data;
        } catch (error) {
            // Fallback a caché
            const cached = await this.readFromIDB<T>(key);
            if (cached) {
                this.memory.set(key, cached);
                return cached.data;
            }
            throw error;
        }
    }
    
    private async staleWhileRevalidate<T>(
        key: string,
        fetcher: () => Promise<T>
    ): Promise<T> {
        const cached = await this.readFromIDB<T>(key);
        const isValid = cached && !this.isExpired(cached);
        
        if (isValid) {
            this.memory.set(key, cached!);
            
            // Actualizar en background
            this.updateInBackground<T>(key, fetcher).catch(console.warn);
            
            return cached!.data;
        }
        
        // Si no existe o es muy viejo, traer de API
        const data = await fetcher();
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: this.maxAge
        };
        
        this.memory.set(key, entry);
        await this.writeToIDB(key, entry);
        
        return data;
    }
    
    private async updateInBackground<T>(
        key: string,
        fetcher: () => Promise<T>
    ): Promise<void> {
        try {
            const newData = await fetcher();
            const cached = await this.readFromIDB<T>(key);
            
            // Solo actualizar si hay cambios
            if (JSON.stringify(newData) !== JSON.stringify(cached?.data)) {
                const entry: CacheEntry<T> = {
                    data: newData,
                    timestamp: Date.now(),
                    ttl: this.maxAge
                };
                
                this.memory.set(key, entry);
                await this.writeToIDB(key, entry);
                
                // Emitir evento
                window.dispatchEvent(new CustomEvent('cache-updated', {
                    detail: { key, data: newData }
                }));
            }
        } catch (error) {
            console.warn(`Error updating cache for ${key}:`, error);
        }
    }
    
    async invalidate(key: string): Promise<void> {
        this.memory.delete(key);
        await this.deleteFromIDB(key);
    }
    
    async invalidateAll(): Promise<void> {
        this.memory.clear();
        await this.clearIDB();
    }
    
    private async readFromIDB<T>(key: string): Promise<CacheEntry<T> | null> {
        if (!this.indexedDB) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    }
    
    private async writeToIDB<T>(key: string, entry: CacheEntry<T>): Promise<void> {
        if (!this.indexedDB) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put({ key, ...entry });
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    
    private async deleteFromIDB(key: string): Promise<void> {
        if (!this.indexedDB) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    
    private async clearIDB(): Promise<void> {
        if (!this.indexedDB) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    
    private isExpired(entry: CacheEntry): boolean {
        if (!entry.ttl) return false;
        return Date.now() - entry.timestamp > entry.ttl;
    }
    
    getMemoryCacheSize(): number {
        return this.memory.size;
    }
    
    getMemoryCacheEntries(): string[] {
        return Array.from(this.memory.keys());
    }
}

// Singleton
let cacheManagerInstance: CacheManager | null = null;

export const getCacheManager = (maxAge?: number): CacheManager => {
    if (!cacheManagerInstance) {
        cacheManagerInstance = new CacheManager(maxAge);
    }
    return cacheManagerInstance;
};
```

---

## 3️⃣ Sync Manager para Offline

```typescript
// src/infrastructure/database/SyncManager.ts
export interface SyncOperation {
    id: string;
    entidad: string;
    operacion: 'create' | 'update' | 'delete';
    datos: any;
    timestamp: number;
    retries: number;
}

export class SyncManager {
    private queue: Map<string, SyncOperation> = new Map();
    private isOnline: boolean = navigator.onLine;
    private readonly maxRetries = 5;
    private readonly retryDelay = 2000;
    private readonly dbName = 'santa-isabel-sync';
    private readonly storeName = 'sync-queue';
    private indexedDB: IDBDatabase | null = null;
    
    constructor(
        private httpClient: any,
        private eventEmitter?: any
    ) {
        this.initializeIndexedDB();
        this.setupEventListeners();
    }
    
    private async initializeIndexedDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.indexedDB = request.result;
                this.loadQueueFromDB();
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    }
    
    private setupEventListeners(): void {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.emit('sync-status-changed', { online: true });
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.emit('sync-status-changed', { online: false });
        });
    }
    
    async queueOperation(
        entidad: string,
        operacion: 'create' | 'update' | 'delete',
        datos: any
    ): Promise<string> {
        const id = `${entidad}-${operacion}-${Date.now()}`;
        
        const operation: SyncOperation = {
            id,
            entidad,
            operacion,
            datos,
            timestamp: Date.now(),
            retries: 0
        };
        
        // Guardar en memoria
        this.queue.set(id, operation);
        
        // Guardar en IndexedDB
        await this.saveToDB(operation);
        
        // Emitir evento
        this.emit('operation-queued', operation);
        
        // Procesar si estamos online
        if (this.isOnline) {
            this.processQueue();
        }
        
        return id;
    }
    
    async processQueue(): Promise<void> {
        if (!this.isOnline || this.queue.size === 0) {
            return;
        }
        
        const operations = Array.from(this.queue.values());
        
        for (const operation of operations) {
            const success = await this.executeOperation(operation);
            
            if (success) {
                // Eliminar de la cola
                this.queue.delete(operation.id);
                await this.deleteFromDB(operation.id);
                this.emit('operation-synced', operation);
            } else {
                operation.retries++;
                
                if (operation.retries >= this.maxRetries) {
                    // Demasiados reintentos
                    this.emit('operation-failed', operation);
                    this.queue.delete(operation.id);
                    await this.deleteFromDB(operation.id);
                } else {
                    // Guardar con reintentos incrementados
                    await this.saveToDB(operation);
                    this.emit('operation-retry', {
                        ...operation,
                        retryAttempt: operation.retries
                    });
                }
            }
        }
    }
    
    private async executeOperation(operation: SyncOperation): Promise<boolean> {
        try {
            const endpoint = this.getEndpoint(operation.entidad);
            
            switch (operation.operacion) {
                case 'create':
                    await this.httpClient.post(endpoint, operation.datos);
                    break;
                case 'update':
                    await this.httpClient.put(
                        `${endpoint}/${operation.datos.id}`,
                        operation.datos
                    );
                    break;
                case 'delete':
                    await this.httpClient.delete(
                        `${endpoint}/${operation.datos.id}`
                    );
                    break;
            }
            
            return true;
        } catch (error) {
            console.error(`Sync failed for ${operation.id}:`, error);
            return false;
        }
    }
    
    private getEndpoint(entidad: string): string {
        const endpoints: Record<string, string> = {
            'Paciente': '/api/pacientes',
            'Historia': '/api/historias',
            'Cita': '/api/citas',
            'Usuario': '/api/usuarios'
        };
        
        return endpoints[entidad] || `/api/${entidad.toLowerCase()}s`;
    }
    
    private async saveToDB(operation: SyncOperation): Promise<void> {
        if (!this.indexedDB) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(operation);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    
    private async deleteFromDB(id: string): Promise<void> {
        if (!this.indexedDB) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    
    private async loadQueueFromDB(): Promise<void> {
        if (!this.indexedDB) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const operations = request.result as SyncOperation[];
                operations.forEach(op => this.queue.set(op.id, op));
                resolve();
            };
        });
    }
    
    getQueueStatus() {
        return {
            isOnline: this.isOnline,
            pendingOperations: this.queue.size,
            operations: Array.from(this.queue.values())
        };
    }
    
    private emit(event: string, data: any): void {
        window.dispatchEvent(new CustomEvent(`sync:${event}`, { detail: data }));
        if (this.eventEmitter) {
            this.eventEmitter.emit(event, data);
        }
    }
}

// Singleton
let syncManagerInstance: SyncManager | null = null;

export const getSyncManager = (httpClient: any, eventEmitter?: any): SyncManager => {
    if (!syncManagerInstance) {
        syncManagerInstance = new SyncManager(httpClient, eventEmitter);
    }
    return syncManagerInstance;
};
```

---

## 4️⃣ Composable CRUD Genérico

```typescript
// src/application/composables/useCRUD.ts
import { ref, computed, reactive } from 'vue';

export interface CRUDState<T> {
    items: T[];
    selectedItem: T | null;
    loading: boolean;
    error: string | null;
    total: number;
    page: number;
    pageSize: number;
}

export interface CRUDService<T> {
    obtenerTodos(filtros?: any): Promise<T[]>;
    obtener(id: any): Promise<T>;
    crear(datos: any): Promise<T>;
    actualizar(id: any, datos: any): Promise<T>;
    eliminar(id: any): Promise<void>;
    buscar(criterios: any): Promise<T[]>;
}

export function useCRUD<T>(
    entityName: string,
    service: CRUDService<T>,
    options: {
        autoLoad?: boolean;
        pageSize?: number;
    } = {}
) {
    const {
        autoLoad = true,
        pageSize = 10
    } = options;
    
    // Estado
    const state = reactive<CRUDState<T>>({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        total: 0,
        page: 1,
        pageSize
    });
    
    // Computed
    const hasItems = computed(() => state.items.length > 0);
    const isEmpty = computed(() => state.items.length === 0);
    const totalPages = computed(() => Math.ceil(state.total / state.pageSize));
    const isLoading = computed(() => state.loading);
    const hasError = computed(() => state.error !== null);
    
    // Métodos
    const load = async (filters?: any) => {
        state.loading = true;
        state.error = null;
        
        try {
            state.items = await service.obtenerTodos(filters);
            state.total = state.items.length;
            state.page = 1;
        } catch (error: any) {
            state.error = error.message || `Error cargando ${entityName}`;
        } finally {
            state.loading = false;
        }
    };
    
    const getById = async (id: any) => {
        state.loading = true;
        state.error = null;
        
        try {
            return await service.obtener(id);
        } catch (error: any) {
            state.error = error.message || `Error obteniendo ${entityName}`;
            throw error;
        } finally {
            state.loading = false;
        }
    };
    
    const create = async (datos: any) => {
        state.loading = true;
        state.error = null;
        
        try {
            const nuevoItem = await service.crear(datos);
            state.items.unshift(nuevoItem);
            state.total++;
            return nuevoItem;
        } catch (error: any) {
            state.error = error.message || `Error creando ${entityName}`;
            throw error;
        } finally {
            state.loading = false;
        }
    };
    
    const update = async (id: any, datos: any) => {
        state.loading = true;
        state.error = null;
        
        try {
            const updated = await service.actualizar(id, datos);
            const index = state.items.findIndex(item => (item as any).id === id);
            if (index !== -1) {
                state.items[index] = updated;
            }
            
            if (state.selectedItem && (state.selectedItem as any).id === id) {
                state.selectedItem = updated;
            }
            
            return updated;
        } catch (error: any) {
            state.error = error.message || `Error actualizando ${entityName}`;
            throw error;
        } finally {
            state.loading = false;
        }
    };
    
    const remove = async (id: any) => {
        state.loading = true;
        state.error = null;
        
        try {
            await service.eliminar(id);
            state.items = state.items.filter(item => (item as any).id !== id);
            state.total--;
            
            if (state.selectedItem && (state.selectedItem as any).id === id) {
                state.selectedItem = null;
            }
        } catch (error: any) {
            state.error = error.message || `Error eliminando ${entityName}`;
            throw error;
        } finally {
            state.loading = false;
        }
    };
    
    const search = async (criterios: any) => {
        state.loading = true;
        state.error = null;
        
        try {
            state.items = await service.buscar(criterios);
            state.total = state.items.length;
            state.page = 1;
        } catch (error: any) {
            state.error = error.message || `Error buscando ${entityName}`;
        } finally {
            state.loading = false;
        }
    };
    
    const select = (item: T | null) => {
        state.selectedItem = item;
    };
    
    const clearError = () => {
        state.error = null;
    };
    
    const nextPage = () => {
        if (state.page < totalPages.value) {
            state.page++;
        }
    };
    
    const prevPage = () => {
        if (state.page > 1) {
            state.page--;
        }
    };
    
    const goToPage = (page: number) => {
        if (page > 0 && page <= totalPages.value) {
            state.page = page;
        }
    };
    
    // Cargar al montar si autoLoad es true
    if (autoLoad) {
        load();
    }
    
    return {
        // State
        state,
        items: computed(() => state.items),
        selectedItem: computed(() => state.selectedItem),
        loading: computed(() => state.loading),
        error: computed(() => state.error),
        
        // Computed
        hasItems,
        isEmpty,
        totalPages,
        isLoading,
        hasError,
        
        // Métodos CRUD
        load,
        getById,
        create,
        update,
        remove,
        search,
        select,
        clearError,
        
        // Paginación
        nextPage,
        prevPage,
        goToPage,
        currentPage: computed(() => state.page),
        pageSize: computed(() => state.pageSize),
        total: computed(() => state.total)
    };
}
```

---

## 5️⃣ Composable de Sincronización con Eventos

```typescript
// src/application/composables/useSync.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { getSyncManager } from '@/infrastructure/database/SyncManager';

export function useSync() {
    const isOnline = ref(navigator.onLine);
    const pendingSync = ref(0);
    const isSyncing = ref(false);
    const syncError = ref<string | null>(null);
    
    const syncManager = getSyncManager(null);
    
    onMounted(() => {
        // Escuchar eventos de sincronización
        window.addEventListener('sync:sync-status-changed', (event: any) => {
            isOnline.value = event.detail.online;
            if (event.detail.online) {
                syncError.value = null;
            }
        });
        
        window.addEventListener('sync:operation-queued', () => {
            updatePendingCount();
        });
        
        window.addEventListener('sync:operation-synced', () => {
            updatePendingCount();
        });
        
        window.addEventListener('sync:operation-failed', (event: any) => {
            syncError.value = `Error sincronizando ${event.detail.entidad}`;
        });
        
        window.addEventListener('sync:operation-retry', (event: any) => {
            console.log(`Reintentando ${event.detail.entidad}, intento ${event.detail.retryAttempt}`);
        });
        
        updatePendingCount();
    });
    
    onUnmounted(() => {
        // Limpiar listeners
        window.removeEventListener('sync:sync-status-changed', () => {});
        window.removeEventListener('sync:operation-queued', () => {});
        window.removeEventListener('sync:operation-synced', () => {});
        window.removeEventListener('sync:operation-failed', () => {});
        window.removeEventListener('sync:operation-retry', () => {});
    });
    
    const updatePendingCount = () => {
        const status = syncManager.getQueueStatus();
        pendingSync.value = status.pendingOperations;
    };
    
    const syncNow = async () => {
        isSyncing.value = true;
        syncError.value = null;
        
        try {
            await syncManager.processQueue();
            updatePendingCount();
        } catch (error: any) {
            syncError.value = error.message;
        } finally {
            isSyncing.value = false;
        }
    };
    
    return {
        isOnline,
        pendingSync,
        isSyncing,
        syncError,
        syncNow,
        updatePendingCount
    };
}
```

---

## 6️⃣ Inicialización en main.ts

```typescript
// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Importar servicios e infraestructura
import { PacienteService } from '@/core/services/PacienteService';
import { HttpPacienteRepository } from '@/infrastructure/repositories/HttpPacienteRepository';
import { PacienteValidator } from '@/infrastructure/validators/PacienteValidator';
import { HttpClient } from '@/infrastructure/http/HttpClient';
import { getCacheManager } from '@/infrastructure/cache/CacheManager';
import { getSyncManager } from '@/infrastructure/database/SyncManager';

// Crear instancias
const httpClient = new HttpClient({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    },
    interceptors: {
        request: (config) => {
            // Agregar token a cada solicitud
            const token = localStorage.getItem('token');
            if (token) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        error: (error) => {
            if (error.status === 401) {
                // Redirigir a login si no autorizado
                router.push('/login');
            }
            return error;
        }
    }
});

const cacheManager = getCacheManager(10 * 60 * 1000); // 10 minutos
const syncManager = getSyncManager(httpClient);

// Crear servicios
const pacienteRepository = new HttpPacienteRepository(httpClient);
const pacienteValidator = new PacienteValidator();
const pacienteService = new PacienteService(pacienteRepository, pacienteValidator);

// Crear app
const app = createApp(App);
const pinia = createPinia();

// Proporcionar servicios
app.provide('pacienteService', pacienteService);
app.provide('httpClient', httpClient);
app.provide('cacheManager', cacheManager);
app.provide('syncManager', syncManager);

app.use(pinia);
app.use(router);
app.mount('#app');

// Procesar cola de sincronización al cargar
window.addEventListener('load', () => {
    syncManager.processQueue();
});
```

---

## 7️⃣ Formulario Reactivo Completo

```vue
<!-- src/presentation/components/organisms/Pacientes/PacienteForm.vue -->
<template>
    <div class="paciente-form">
        <form @submit.prevent="guardar">
            <!-- Sección Personal -->
            <fieldset class="form-section">
                <legend>Información Personal</legend>
                
                <div class="form-row">
                    <FormField
                        label="Nombre"
                        :error="errores.nombre"
                    >
                        <input
                            v-model="formulario.nombre"
                            type="text"
                            placeholder="Ej: Juan"
                            @blur="validarCampo('nombre')"
                        >
                    </FormField>
                    
                    <FormField
                        label="Apellido"
                        :error="errores.apellido"
                    >
                        <input
                            v-model="formulario.apellido"
                            type="text"
                            placeholder="Ej: Pérez"
                            @blur="validarCampo('apellido')"
                        >
                    </FormField>
                </div>
                
                <div class="form-row">
                    <FormField
                        label="Tipo Documento"
                        :error="errores.tipoDocumento"
                    >
                        <select v-model="formulario.tipoDocumento">
                            <option value="">Seleccionar</option>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="PP">Pasaporte</option>
                            <option value="TI">Tarjeta de Identidad</option>
                        </select>
                    </FormField>
                    
                    <FormField
                        label="Documento"
                        :error="errores.documento"
                    >
                        <input
                            v-model="formulario.documento"
                            type="text"
                            placeholder="Ej: 1234567890"
                            @blur="validarCampo('documento')"
                        >
                    </FormField>
                </div>
                
                <div class="form-row">
                    <FormField
                        label="Fecha de Nacimiento"
                        :error="errores.fechaNacimiento"
                    >
                        <input
                            v-model="formulario.fechaNacimiento"
                            type="date"
                            @blur="validarCampo('fechaNacimiento')"
                        >
                    </FormField>
                    
                    <FormField
                        label="Género"
                        :error="errores.genero"
                    >
                        <select v-model="formulario.genero">
                            <option value="">Seleccionar</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </FormField>
                </div>
            </fieldset>
            
            <!-- Sección Contacto -->
            <fieldset class="form-section">
                <legend>Información de Contacto</legend>
                
                <div class="form-row">
                    <FormField
                        label="Email"
                        :error="errores.email"
                    >
                        <input
                            v-model="formulario.email"
                            type="email"
                            placeholder="Ej: juan@example.com"
                            @blur="validarCampo('email')"
                        >
                    </FormField>
                    
                    <FormField
                        label="Teléfono"
                        :error="errores.telefono"
                    >
                        <input
                            v-model="formulario.telefono"
                            type="tel"
                            placeholder="Ej: 3012345678"
                            @blur="validarCampo('telefono')"
                        >
                    </FormField>
                </div>
                
                <div class="form-row">
                    <FormField
                        label="Dirección"
                        :error="errores.direccion"
                    >
                        <input
                            v-model="formulario.direccion"
                            type="text"
                            placeholder="Calle 10 # 5-30"
                        >
                    </FormField>
                </div>
                
                <div class="form-row">
                    <FormField
                        label="Ciudad"
                        :error="errores.ciudad"
                    >
                        <select v-model="formulario.ciudad">
                            <option value="">Seleccionar</option>
                            <option value="Bogotá">Bogotá</option>
                            <option value="Medellín">Medellín</option>
                            <option value="Cali">Cali</option>
                            <option value="Barranquilla">Barranquilla</option>
                        </select>
                    </FormField>
                </div>
            </fieldset>
            
            <!-- Botones -->
            <div class="form-actions">
                <button
                    type="button"
                    class="btn btn-secondary"
                    @click="cancelar"
                    :disabled="cargando"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="cargando || tieneErrores"
                >
                    {{ cargando ? 'Guardando...' : pacienteEditando ? 'Actualizar' : 'Crear' }}
                </button>
            </div>
            
            <!-- Mensajes de error -->
            <div v-if="error" class="alert alert-error">
                {{ error }}
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { usePacientes } from '@/composables/usePacientes';
import FormField from '@/components/atoms/FormField.vue';

const props = defineProps({
    pacienteId: String
});

const emit = defineEmits(['saved', 'canceled']);

// Usar composable
const { crear, actualizar, cargando, error } = usePacientes();

// Estado local
const formulario = reactive({
    nombre: '',
    apellido: '',
    tipoDocumento: '',
    documento: '',
    fechaNacimiento: '',
    genero: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: ''
});

const errores = reactive({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: ''
});

const pacienteEditando = ref(false);

const tieneErrores = computed(() => {
    return Object.values(errores).some(error => error.length > 0);
});

onMounted(async () => {
    if (props.pacienteId) {
        pacienteEditando.value = true;
        // Cargar datos del paciente
    }
});

const validarCampo = (campo: string) => {
    const validadores: Record<string, () => string> = {
        nombre: () => {
            if (!formulario.nombre.trim()) return 'Nombre requerido';
            if (formulario.nombre.length < 3) return 'Mínimo 3 caracteres';
            return '';
        },
        email: () => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regex.test(formulario.email)) return 'Email inválido';
            return '';
        },
        telefono: () => {
            const regex = /^[\d\s\-\+\(\)]{10,}$/;
            if (!regex.test(formulario.telefono)) return 'Teléfono inválido';
            return '';
        }
    };
    
    if (validadores[campo]) {
        errores[campo as keyof typeof errores] = validadores[campo]();
    }
};

const guardar = async () => {
    try {
        if (pacienteEditando.value) {
            await actualizar(props.pacienteId!, formulario);
        } else {
            await crear(formulario);
        }
        emit('saved');
    } catch (err) {
        console.error('Error guardando:', err);
    }
};

const cancelar = () => {
    emit('canceled');
};
</script>

<style scoped>
.paciente-form {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.form-section {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.form-section legend {
    font-weight: bold;
    padding: 0 0.5rem;
    color: #333;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background-color: #0056b3;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background-color: #545b62;
}

.alert-error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
}
</style>
```

---

## 8️⃣ Configuración de Pinia Store

```typescript
// src/application/stores/index.ts
import { createPinia } from 'pinia';

// Crear instancia de Pinia
export const pinia = createPinia();

// Importar todos los stores
export { usePacientesStore } from './modules/pacientes';
export { useHistoriasStore } from './modules/historias';
export { useCitasStore } from './modules/citas';
export { useUIStore } from './modules/ui';
export { useNotificationsStore } from './modules/notifications';
```

---

## 9️⃣ Interceptor de Autenticación

```typescript
// src/infrastructure/http/interceptors.ts
export function setupAuthInterceptor(httpClient: HttpClient) {
    httpClient.setHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
    
    // Escuchar cambios de token
    window.addEventListener('auth:token-changed', (event: any) => {
        if (event.detail.token) {
            httpClient.setHeader('Authorization', `Bearer ${event.detail.token}`);
        } else {
            httpClient.removeHeader('Authorization');
        }
    });
}

export function setupErrorInterceptor(httpClient: HttpClient, router: any) {
    // Error handling
    const originalRequest = httpClient.request;
    
    httpClient.request = async function(...args: any[]) {
        try {
            return await originalRequest.apply(this, args);
        } catch (error: any) {
            if (error.status === 401) {
                // Token expirado
                localStorage.removeItem('token');
                router.push('/login');
            } else if (error.status === 403) {
                // Acceso denegado
                router.push('/unauthorized');
            } else if (error.status >= 500) {
                // Error del servidor
                console.error('Server error:', error);
            }
            
            throw error;
        }
    };
}
```

---

*Ejemplos de código práctica - Santa Isabel*
*Listos para copiar y pegar en tu proyecto*
