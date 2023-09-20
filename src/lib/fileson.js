// Utility library for processing Fileson .fson files,
// see https://github.com/jokkebk/fileson

// The basic format of .fson file is one json object per line.
// Each line is an array of either:
// 1. [key, value] representing a new key/value pair added or updated
// 2. [key], representing a key being deleted
//
// Special [":name:", value] pairs are used to represent system values.
//
// Example:
// 
// [":scan:", 1]
// [":checksum:", "sha1"]
// [":date_gmt:", "2021-02-25 09:04:58"]
// ["example.7z", {"modified_gmt": "2021-02-13 09:06:01", "sha1": "240c2f774cef8a4dab5acc08152cf994bdbe1c0f", "size": 324989495}]
// ["Alpha Zero chess and shogi paper.pdf", {"modified_gmt": "2018-05-27 14:11:35", "sha1": "38fb1902c4838b4f767d4532b28a92473ea737aa", "size": 3893589}]
// ["Code/AlphaZero/source.go", {"modified_gmt": "2018-07-20 22:21:16", "sha1": "1afdf1006fbba48a87885b5562e9b2b015434fe8", "size": 205868}]
// ["My Books/Math/Algebra.pdf", {"modified_gmt": "2018-07-20 21:37:09", "sha1": "abc47c0fa7ee7bbec05a28d539bba3fe0dc3ab74", "size": 859558}]
// ["My Books/LotR/TwoTowers.epub", {"modified_gmt": "2013-03-23 09:01:15", "sha1": "a3fd0db1bf9a653ca1b78eabdffe839851c53143", "size": 458588}]
// [":scan:", 2]
// [":directory:", "/mnt/e/Books"]
// [":checksum:", "sha1"]
// [":date_gmt:", "2021-02-28 09:19:26"]
// [".", {"modified_gmt": "2021-02-13 09:10:05"}]
// ["My Books", {"modified_gmt": "2013-03-23 09:05:44"}]

function parseFsonLine(line) {
    const arr = JSON.parse(line);
    // If arr has only one element, it's a delete operation, otherwise it's an add/update operation
    return (arr.length === 1) ? [arr[0], null] : arr;
    // Note that we don't handle the case where arr has more than two elements
}

// Split a .fson file into segments, each starting with one or more system values.
// Return results as array of objects with system values as keys and
// arrays of normal entries under "entries" key.
export function parseFsonSegments(lines) {
    let segment = {entries: []}; // Current segment
    const segments = [segment]; // Start with one empty segment

    // Loop through lines, parse them and do value counts
    for (const line of lines) {
        // Skip empty & whitespace only lines
        if (!line.trim()) continue;

        const [key, value] = parseFsonLine(line);
        
        // This is a system value
        if (key.startsWith(':')) {
            // Extract system value name
            const [, name] = key.match(/^:(.+):$/);

            // If we have zero normal entries yet, add this system value to the current segment
            if (segment.entries.length === 0) {
                //console.log('Adding system value', name, value, 'to segment');
                segment[name] = value;
            } else { // Otherwise, start a new segment with this system value
                //console.log('Starting new segment with system value', name, value);
                segment = {[name]: value, entries: []};
                segments.push(segment); // Add new segment to segments
            }
        } else { // This is a normal entry
            //console.log('Adding entry', key, value, 'to segment');
            segment.entries.push([key, value]);
        }
    }

    return segments;
}