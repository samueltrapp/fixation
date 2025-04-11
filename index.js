var fs = require('fs'); 
var parser = require('csv-parse');

let data=[];
fs.createReadStream("sample.csv")
    .pipe(parser.parse({delimiter: ','}))
    .on('data', function(csvrow) {
        data.push({
            id: parseInt(csvrow[0]),
            frame: parseInt(csvrow[1]),
            angle: parseFloat(csvrow[2])
        });
    })
    .on('end',function() {
        processData(data);
    });

function processData(data) {
    fs.writeFile("fixations.csv", "", () => {});
    const minLengthForFixation = 6;
    const minGapLengthToSkip = 2;
    
    let counter = 1;
    let referenceIndex = 1;
    let elapsed = 1;
    let prevFrame;

    while (referenceIndex < data.length - 2) {
        const reference = data[referenceIndex];
        let compareIndex = referenceIndex + elapsed;
        prevFrame = reference.frame;

        while (compareIndex < data.length - 1) {
            const compare = data[compareIndex];

            const idMismatch = reference.id !== compare.id; // Check if IDs match
            const isGap = compare.frame - prevFrame - 1 >= minGapLengthToSkip; // Check if too long of a gap has passed
            const isOutOfAngleRange = Math.abs(reference.angle - compare.angle) > 5; // Check if the angle has changed too much

            if (idMismatch || isGap || isOutOfAngleRange) {
                if (elapsed - 1 >= minLengthForFixation) { // Check if enough frames have passed to be considered a fixation
                    fs.appendFile("output.csv", `${counter++}, ${referenceIndex}, ${compareIndex - 1}, ${compareIndex - referenceIndex}\n`, () => {});
                    referenceIndex = compareIndex; // Skip the new reference point to the end of the previous fixation
                }
                else {
                    referenceIndex++; // When no fixation started, move reference up by one data frame and try again
                }
                elapsed = 1;
                break;
            }

            else {
                compareIndex = referenceIndex + ++elapsed; // Move the data frame being compared and the elapsed counter up one
                prevFrame = compare.frame; // Store the current frame to compare against the next
            }
        }
        if (compareIndex >= data.length - 1) {
            break; // End early when the compare point has reached the end of the data
        }
    }
}