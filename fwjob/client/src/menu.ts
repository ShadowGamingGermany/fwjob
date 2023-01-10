//import * as native from 'natives';
import { NpcWheelMenu } from '@AthenaClient/menus/npc';
import { IPed } from '@AthenaShared/interfaces/iPed';
import { IWheelOptionExt } from '@AthenaShared/interfaces/wheelMenu';
import {NPC} from '@AthenaPlugins/postbote/shared/locations';
import {FwJob} from '@AthenaPlugins/postbote/server/src/job';

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
            callback: () => {
               FwJob.begin
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
