
let mainFolder = null;
let callback = null;
let manager = null;
let parentGui = null;

let currentFolders = {}

export function initializePostProcessingGUI (renderingManager, materialManager, renderCallback, gui) {
   
  if (!mainFolder) {
    callback = renderCallback;
    manager = renderingManager;
    parentGui = gui;
    updatePostProcessingEditor();
  }
  return mainFolder;
}

export const updatePostProcessingEditor = () => {
    

    if (!parentGui) return

    const paramNameMapping = {}

    let wasClosed = true;
    if (mainFolder) {
        wasClosed = mainFolder.closed;
        parentGui.removeFolder(mainFolder);
    }
    mainFolder = parentGui.addFolder("Post-processing")
    // console.log('creating postprocessing tools:', manager)
    if (manager.currentComposer.bloomComposer !== undefined){
        currentFolders.bloomFolder = createBloomFolder();
    }

    paramNameMapping.TransparentBackground = manager.transparentBackground
    mainFolder.add(paramNameMapping, 'TransparentBackground').onChange(function(value){
        manager.transparentBackground = value;
        callback();
    });

    for (let index = 0; index < manager.currentComposer.passes.length; index++) {
        const element = manager.currentComposer.passes[index];
        paramNameMapping[element.name] = element.enabled;
        // eslint-disable-next-line no-loop-func
        let func = function(value){
            element.enabled = value;
            callback();
        };
        mainFolder.add(paramNameMapping, element.name).onChange(func);
        if (element.name === 'Taa pass'){
            const sampleName = element.name + ' samples';
            paramNameMapping[sampleName] = element.sampleLevel;
            mainFolder.add(paramNameMapping, sampleName, {
                'Level 0: 1 Sample': 0,
                'Level 1: 2 Samples': 1,
                'Level 2: 4 Samples': 2,
                'Level 3: 8 Samples': 3,
                'Level 4: 16 Samples': 4,
                'Level 5: 32 Samples': 5
                } ).onChange(function(value){
                element.sampleLevel = value;
                callback();
            });

            const accumulateName = 'TAA accumulate';
            paramNameMapping[accumulateName] = element.accumulate;
            mainFolder.add(paramNameMapping, accumulateName).onChange(function(value){
                element.accumulate = value;
                callback();
            });
        } else if (element.name === 'SSAA pass'){
            
            const unbiasName = 'SSAA unbias';
            paramNameMapping[unbiasName] = element.unbiased;
            mainFolder.add(paramNameMapping, unbiasName).onChange(function(value){
                element.unbiased = value;
                callback();
            });
            
        }
    }

    

    paramNameMapping.Render = function() { manager.render(false, true); }
    mainFolder.add(paramNameMapping, 'Render');
    
    paramNameMapping.Snapshot = function() {
        manager.renderImage(function (url) {
            window.open(url);            
        }); 
    }

    paramNameMapping['Raw Snapshot'] = function() {
        const resultUrl = manager.renderDebugSnapshot();
        window.open(resultUrl);
    }
    paramNameMapping['Print pixel buffer'] = function() {
        manager.printDebugPixelArray();
    }
    mainFolder.add(paramNameMapping, 'Snapshot');
    mainFolder.add(paramNameMapping, 'Raw Snapshot');
    mainFolder.add(paramNameMapping, 'Print pixel buffer');

    paramNameMapping.PrintStack = function() {
        const stack = manager.getStack();
        console.groupCollapsed('Current post processing stack:', stack.names)
        console.log(stack.values);
        console.groupEnd();
    }
    mainFolder.add(paramNameMapping, 'PrintStack');

    mainFolder.add(manager, 'dynamicAntialiasing');

    

    mainFolder.add(manager.lastSize, 'pixelRatio').onFinishChange(function(value){
        const oldX = manager.lastSize.x
        const oldY = manager.lastSize.y
        manager.setSize(oldX, oldY, value)
        callback();
    });


    
  if (!wasClosed){
    mainFolder.open();
  }
};








const createBloomFolder = () => {

    const bloomFolder = mainFolder.addFolder("Bloom");
    // console.log(postProcessingManager)
    const bloomPass = manager.currentComposer.bloomComposer.bloomPass;
    bloomFolder.add(bloomPass, "enabled").onChange(function(value) {
        bloomPass.enabled = value;
        callback();
    });
    bloomFolder.add(bloomPass, "strength", 0, 2).onChange(function (value) {
        bloomPass.strength = value;
        callback();
    });
    bloomFolder.add(bloomPass, "threshold", 0, 1).onChange(function (value) {
        bloomPass.threshold = value;
        callback();
    });
    bloomFolder.add(bloomPass, "radius", 0, 2).onChange(function (value) {
        bloomPass.radius = value;
        callback();
    });
    return bloomFolder;
}


export default initializePostProcessingGUI;
