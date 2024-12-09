#target photoshop

if (app.documents.length > 0) {
    var myDocument = app.activeDocument;
    var theName = myDocument.name.match(/(.*)\.[^\.]+$/)[1];
    var thePath = myDocument.path;
    var theLayer = myDocument.activeLayer;

    // JPG Options
    var jpgSaveOptions = new JPEGSaveOptions();  
    jpgSaveOptions.embedColorProfile = true;  
    jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;  
    jpgSaveOptions.matte = MatteType.NONE;  
    jpgSaveOptions.quality = 11;   

    // PSD Options
    var psdSaveOptions = new PhotoshopSaveOptions();
    psdSaveOptions.alphaChannels = true; // Keep alpha channels if any
    psdSaveOptions.layers = true; // Keep layers

    // Check if layer is Smart Object
    if (theLayer.kind != LayerKind.SMARTOBJECT) {
        alert("Selected layer is not a smart object");
    } else {
        // Select Files
        var theFiles = File.openDialog("Please select files", "*.png;*.psd;*.tif;*.jpg", true);
        
        if (theFiles) {
            for (var m = 0; m < theFiles.length; m++) {
                // Replace Smart Object
                theLayer = replaceContents(theFiles[m], theLayer);

                // Fit the new content to the smart object
                fitToSmartObject(theLayer);

                var theNewName = theFiles[m].name.match(/(.*)\.[^\.]+$/)[1];

                // Save as PSD
                myDocument.saveAs(new File(thePath + "/" + theNewName + ".psd"), psdSaveOptions, true, Extension.LOWERCASE);

                // Save as JPG
                myDocument.saveAs(new File(thePath + "/" + theNewName + ".jpg"), jpgSaveOptions, true, Extension.LOWERCASE);
            }
        }
    }
}

// Function to replace Smart Object contents
function replaceContents(newFile, theSO) {
    app.activeDocument.activeLayer = theSO;

    var idplacedLayerReplaceContents = stringIDToTypeID("placedLayerReplaceContents");
    var desc3 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    desc3.putPath(idnull, new File(newFile));
    var idPgNm = charIDToTypeID("PgNm");
    desc3.putInteger(idPgNm, 1);
    executeAction(idplacedLayerReplaceContents, desc3, DialogModes.NO);

    return app.activeDocument.activeLayer;
}

// Function to fit the new content within the smart object bounds
function fitToSmartObject(layer) {
    var smartObjectBounds = layer.bounds; // Get bounds of the smart object
    var smartObjectWidth = smartObjectBounds[2].value - smartObjectBounds[0].value; // Width
    var smartObjectHeight = smartObjectBounds[3].value - smartObjectBounds[1].value; // Height

    // Get bounds of the newly placed content
    var contentBounds = app.activeDocument.activeLayer.bounds; 
    var contentWidth = contentBounds[2].value - contentBounds[0].value; // Width of new content
    var contentHeight = contentBounds[3].value - contentBounds[1].value; // Height of new content

    // Calculate scale factors
    var widthScale = smartObjectWidth / contentWidth;
    var heightScale = smartObjectHeight / contentHeight;

    // Use the smaller scale to maintain aspect ratio
    var scaleFactor = Math.min(widthScale, heightScale) * 100;

    // Resize the content to fit the smart object
    app.activeDocument.activeLayer.resize(scaleFactor, scaleFactor, AnchorPosition.MIDDLECENTER);
}

// Alert letting the user know the script has finished
alert("Finished!\nThe script has finished saving the JPEG and PSD files in the folder with the original mockup.");