import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { FwJob } from './src/job';

const PLUGIN_NAME = 'FwJob';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    FwJob.init();
});
