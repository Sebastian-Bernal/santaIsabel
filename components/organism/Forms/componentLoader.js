// utils/componentLoader.js
import { defineAsyncComponent } from 'vue';

export function loadComponent(name) {
  const componentMap = {
    Input: () => import('~/components/atoms/Inputs/Input.vue'),
    Select: () => import('~/components/atoms/Selects/Select.vue'),
    Label: () => import('~/components/atoms/Labels/Label.vue'),
    SelectSearch: () => import('~/components/atoms/Selects/SelectSearch.vue'),
    SelectMultiple: () => import('~/components/atoms/Selects/SelectMultiple.vue'),
    Textarea: () => import('~/components/atoms/Textareas/Textarea.vue'),
    Checkbox: () => import('~/components/atoms/Checkbox/Checkbox.vue'),
    GroupCampos: () => import('~/components/molecules/groupCampos/GroupCampos.vue'),
    Imagen: () => import('~/components/atoms/Images/Imagen.vue')
  };

  const loader = componentMap[name];
  return loader ? defineAsyncComponent(loader) : null;
}