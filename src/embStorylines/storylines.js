import {loadAttributeSpace} from "./attributeSpace.js";
import {setAttributeSpace} from "./framesStorylines.js";

async function updateYear(year) {
    const attributeSpace = await loadAttributeSpace();
    setAttributeSpace(attributeSpace, year);
}
await updateYear(1935);