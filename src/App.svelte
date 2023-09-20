<script>
// Import fileson.js library
import { parseFsonSegments } from './lib/fileson.js';
import Tree from './lib/Tree.svelte';

let segments = [];
let tree = {};

function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            let fileContent = e.target.result;
            // Split into array of lines and parse
            segments = parseFsonSegments(fileContent.split("\n"));
            tree = {};
        };
        reader.readAsText(file);
    }
}

function updateCounts(tree, action, path, size) {
  let node = tree;
  node.count[action] = (node.count[action] || 0) + 1;
  node.size[action] = (node.size[action] || 0) + size;
  node.sortKey += size; // sortKey is sum of sizes of all actions (insert, update, delete)

  for (const segment of path.split('/')) {
    if (!node.children[segment]) {
      node.children[segment] = { count: {}, size: {}, sortKey: 0, children: {} };
    }
    node = node.children[segment];
    node.count[action] = (node.count[action] || 0) + 1; // count of actions
    node.size[action] = (node.size[action] || 0) + size; // size of actions
    node.sortKey += size; 
  }
}

function buildTree(index) {
    let files = {}; // Map of file names to file objects

    // Run through all entries of segments before index and build file map
    for (let i = 0; i < index; i++) {
        for (let [key, value] of segments[i].entries) {
            // null value means a delete operation
            if (value === null)
                delete files[key];
            else
                files[key] = value;
        }
    }
    
    let tree = { count: {}, size: {}, sortKey: 0, children: {} };

    // Process the segment at index
    for(let [key, value] of segments[index].entries) {
        // null value means a delete operation
        if (value === null) {
            updateCounts(tree, 'delete', key, files[key].size || 0);
            delete files[key];
        } else { // otherwise it's an update or insert
            updateCounts(tree, files[key] ? 'update' : 'insert', key, value.size || 0);
            files[key] = value;
        }
    }
    
    // Recursively sort children based on decreasing sortKey value
    function sortChildren(node) {
        node.children = Object.fromEntries(
            Object.entries(node.children).sort((a, b) => {
                return b[1].sortKey - a[1].sortKey;
            })
        );
        for (const child of Object.values(node.children)) {
            sortChildren(child);
        }
    }

    sortChildren(tree);
    
    segments[index].tree = tree; // store
    console.log('tree', tree);
}

function handleDragOver(event) {
    event.preventDefault();
}
</script>

<div id="drop-area" on:drop={handleDrop} on:dragover={handleDragOver}>
<p>Drag and drop a text file here</p>
</div>

{#each segments as segment, idx}
<h2>{segment.entries.length} entries</h2>
<dl>
    {#each Object.keys(segment) as key}
    {#if key !== 'entries' && key !== 'tree'}
        <dt>{key}</dt>
        <dd>{segment[key]}</dd>
    {/if}
    {/each}
</dl>

{#if 'tree' in segment}
    <Tree expanded={true} node={segment.tree} />
{:else}
    <button on:click={() => buildTree(idx)}>Build tree</button>
{/if}
{/each}

<style>
#drop-area {
    border: 2px dashed gray;
    width: 300px;
    height: 200px;
    text-align: center;
    margin-bottom: 20px;
}

dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 400px;
}

dt {
  font-weight: bold;
}
</style>