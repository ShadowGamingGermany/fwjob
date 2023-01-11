//import * as native from 'natives';
import { NpcWheelMenu } from '@AthenaClient/menus/npc';
import { IPed } from '@AthenaShared/interfaces/iPed';
import { IWheelOptionExt } from '@AthenaShared/interfaces/wheelMenu';
import {JobEvents, NPC} from '@AthenaPlugins/fwjob/shared/locations';
import {FwJob} from '@AthenaPlugins/fwjob/server/src/job';
import { AthenaEvents } from '@AthenaClient/systems/athenaEvents';
import * as alt from 'alt-client';
import * as native from 'natives';
import { AthenaClient } from '@AthenaClient/api/athena';
class InternalFunctions {
    static init() {
        NpcWheelMenu.addInjection(InternalFunctions.handleInjection);
    }

    static handleInjection(scriptID: number, ped: IPed, options: Array<IWheelOptionExt>): Array<IWheelOptionExt> {
        // This is not the NPC we are looking for.
        if (!ped.uid.includes(NPC.PREFIX)) {
            return options;
        }

        options.push({
            name: 'Turn Invisible',
            callback:() => { alt.emitServer(JobEvents.ServerClientEvents.BEGIN);
            },

        });

     options.push({
             name: 'Turn Visible',
            //  callback: () => {
            //      native.setEntityAlpha(scriptID, 255, false);
            //  },
         });

        return options;
    }
}

InternalFunctions.init();
