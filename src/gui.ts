import { Instance, RenderStatus, Scene } from "./global";
import { Pane } from 'tweakpane';

const pane = new Pane();

function addIntanceGui(instance: Instance){
    const f = pane.addFolder({ title: instance.model.name });
    f.addBinding(instance.transform, "translation");
    f.addBinding(instance.transform, "rotation");
    f.addBinding(instance.transform, "scale");
}

interface Monitor{
    recording: boolean,
    fps: number
}

function addMonitor(monitor: Monitor, renderStatus: RenderStatus){
    const f = pane.addFolder({ title: "Monitor" });
    const btn = f.addButton({ title: "Toggle record" });
    f.addBinding(monitor, "recording", {
        readonly: true
    });
    f.addBinding(monitor, "fps", {
        readonly: true, format: (v) => v.toFixed(0)
    });
    f.addBinding(renderStatus, "totalTrig", {
        readonly: true, format: (v) => v.toFixed(0)
    });
    f.addBinding(renderStatus, "geometryTime", {
        readonly: true
    });
    f.addBinding(renderStatus, "rasterizationTime", {
        readonly: true
    });
    f.addBinding(renderStatus, "totalTimeTake", {
        readonly: true
    })

    return [btn]
}

function showMonitor(){
    let start = 0;
    let fps = 0;
    const monitor: Monitor = {
        recording: true,
        fps: 0
    };
    const renderStatus: RenderStatus = {
        totalTrig: 0,
        geometryTime: 0,
        rasterizationTime: 0,
        totalTimeTake: 0
    };
    const [btn] = addMonitor(monitor, renderStatus);
    btn.element.querySelector("button")!.setAttribute("style", `color: ${monitor.recording ? "green" : "red"};`);
    btn.on("click", () => {
        monitor.recording = !monitor.recording;
        btn.element.querySelector("button")!.setAttribute("style", `color: ${monitor.recording ? "green" : "red"};`);
    });

    return [
        () => {
            if(!monitor.recording){
                return;
            }

            const end = performance.now();
            if(end - start < 1000){
                fps++;
            }
            else{
                monitor.fps = fps;
                fps = 0;
                start = performance.now();
            }
        },
        renderStatus
    ] as const;
}

export { pane, addIntanceGui, showMonitor }