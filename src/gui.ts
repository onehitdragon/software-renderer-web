import { Instance, Scene } from "./global";
import { Pane } from 'tweakpane';

const pane = new Pane();

function addIntanceGui(instance: Instance){
    const f = pane.addFolder({ title: instance.model.name });
    f.addBinding(instance.transform, "translation");
    f.addBinding(instance.transform, "rotation");
    f.addBinding(instance.transform, "scale");
}

export { pane, addIntanceGui }