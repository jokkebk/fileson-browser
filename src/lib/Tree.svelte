<script>
export let node; // tree node
export let name = '/'; // my name, default to root
export let expanded = false; // am I expanded or not?

function formatNumber(num) {
    // Use GB, MB, KB, or B
    if (num > 1000000000)
        return `<strong>${(num / 1000000000).toFixed(2)} GB</strong>`;
    else if (num > 1000000)
        return `${(num / 1000000).toFixed(2)} MB`;
    else if (num > 1000)
        return `${(num / 1000).toFixed(2)} KB`;
    else
        return `${num} B`;
}

function summarize(node) {
    const colors = {
        insert: 'green',
        update: 'blue',
        delete: 'red'
    };
    let summary = '';
    if (node && node.count) {
        summary = Object.keys(node.count)
        .map(action => `<span style="color: ${colors[action]}">${node.count[action]} ${action}s, ${formatNumber(node.size[action])}</span>`)
        .join(', ');
    }
    return summary;
}

$: summary = summarize(node);
</script>

<style>
.tree-node {
    margin-left: 20px;
}
</style>

<div class="tree-node">

<p>
<strong>
    <button on:click={() => {expanded = !expanded; }}>{expanded ? '-' : '+'}</button>
    {name}
</strong> {@html summary}
</p>

{#if expanded}
{#each Object.keys(node.children) as key}
<svelte:self name={key} node={node.children[key]} />
{/each}
{/if}

</div> <!-- tree-node -->