<template>
<div class="con" id="new-group-container">
    <h1>Start Group Chat:</h1><br>
    <p>Group Name:</p><input type="text" id="new-group-name"> <br>
    <button onclick="new_group(document.getElementById('new-group-name').value);">Start Group</button>
</div>
</template>

<script>
import { new_group } from '../../../js.js';

export default {
    data() {
        return {

        }
    },
    methods: {
        
    }
}
</script>