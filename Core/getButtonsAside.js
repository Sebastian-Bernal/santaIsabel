import { buttons } from "~/data/Buttons"

export const getButtonsAside = async() => {
    try{
        // const res = await fetch('https//nose');
        // const buttonsJson = await res.json();
        
        const buttonsJson = buttons.value

        return buttonsJson
    }
    catch(error){
        console.log(error)
    }
}