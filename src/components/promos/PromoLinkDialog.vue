<template>
  <v-dialog
    :value="showTemplateDialog"
    width="400"
    @click:outside="$emit('close')"
  >
    <v-card id="template-card">
      <v-card-title class="text-h5 font-weight-bold" v-if="selectedTemplate">
        {{selectedTemplate.name}}
        <v-btn fab icon text absolute right top class="dialog-close-btn" @click="$emit('close')"><v-icon>close</v-icon></v-btn>
      </v-card-title>
      <v-card-text v-if="selectedTemplate">
        <v-row>
          <v-col class="windows-title" cols="12">Length</v-col>
        </v-row>
        <v-row>
          <v-col class="window-name-col" cols="12" v-for="window in selectedTemplate.windows" :key="window.key">
            <v-row class="px-5">{{window.name}}</v-row>
            <v-row>
              <v-col class="rewards-title mt-5" cols="12">Rewards</v-col>
              <v-col class="reward-row-col" cols="12" v-for="reward in window.rewards" :key="reward.id">
                <v-row justify="space-around" class="px-2" v-if="reward && reward.metadata && reward.metadata.labels && reward.metadata.labels.en && marketKey">
                  <v-col cols="4">{{reward.metadata.labels.en[marketKey].goal}}</v-col>
                  <v-col cols="8">{{reward.metadata.labels.en[marketKey].reward}}</v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    showTemplateDialog: Boolean,
    selectedTemplate: Object,
    marketKey: String
  }
}
</script>

<style>
.dialog-close-btn {
  top: 16px !important;
  right: 16px;
}

#template-card {
  padding: 16px;
}

.windows-title {
  font-size: 17px;
  font-weight: bold;
}

.window-name-col {
  padding-top: 0px;
}

.rewards-title {
  font-size: 17px;
  font-weight: bold;
}

.reward-row-col, .reward-row-col .col {
  padding-top: 2px;
  padding-bottom: 2px;
}
</style>
