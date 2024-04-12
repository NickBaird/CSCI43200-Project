<template>
<div class="con" id="invite-group-container">
    <h1>Invite To Group</h1><br>
    <p>Group ID:</p><input type="text" id="new-group-id"> <br>
    <p>User ID:</p><input type="text" id="new-group-uid"><br>
    <button onclick="send_group_invite(document.getElementById('new-group-id').value, document.getElementById('new-group-uid').value)">Invite to Group</button>
</div>
</template>

<script>
import { send_group_invite } from '../../../js.js';

export default {
    data() {
        return {

        }
    },
    methods: {
    }
}
</script>