// to do:
// easily changeable frames content
//---------------------------------------------------------------------------------------------------------------------

import './myMap.js';

// creates ticks on timeline
// sets start year
// show people's timelines and highlight them
// creates dataset from attributeSpace
// gives the year and the dataset to frames2D
// updates lines
// import './timeline.js'; // RembST-just
import  './RembSTemb/embeddedTimeline.js'; // RembST-emb

// stores the function to create dataset by Frame (Building: owner, tenants)
import './RembSTemb/attributeSpace.js';

// adds data to frames based on year selected in timeline
// import './frames2D.js'; // RembST-juxt
import './RembSTemb/framesEmbedTime.js'; // RembST-emb

import './raycasting.js';
// import './pathes.js';
import './RembSTemb/lines.js';

// highlights users
import './RembSTemb/interaction.js'; // highlightOwnerTimeline <---------

// index.html: combinationIcon, timelines <---------

