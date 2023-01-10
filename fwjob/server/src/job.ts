import * as alt from 'alt-server';
import { MARKER_TYPE } from '@AthenaShared/enums/markerTypes';
import { Objective } from '@AthenaShared/interfaces/job';
import JOB_DATA from '@AthenaPlugins/postbote/shared/locations';
import {NPC} from '@AthenaPlugins/postbote/shared/locations';
import {location} from '@AthenaPlugins/postbote/shared/locations';
import JobEnums from '@AthenaShared/interfaces/job';
import { CurrencyTypes } from '@AthenaShared/enums/currency';
import { Athena } from '@AthenaServer/api/athena';

const START_POINT = {x: 95.94123077392578, y: 6367.181640625, z: 29.375844955444336 -1} ;
const TOTAL_DROP_OFFS = 5;

export class FwJob {
/*
     * Create In-World Job Location(s)
     * @static
     * @memberof Job
     */
    
    static init() {
        Athena.controllers.blip.append({
            sprite: 616,
            color: 5,
            pos: START_POINT,
            scale: 1,
            shortRange: true,
            text: 'Fw Warenlieferung',
        });
        //  Athena.controllers.interaction.add({
        //      callback: FwJob.begin,
        //      description: '',
        //      position: START_POINT,
        //      range: 2,
        //      isPlayerOnly: true,
        //  });

     Athena.controllers.ped.append({
         model: 'A_F_M_FatCult_01',
         pos: location,
         heading: 254.62277221679688,
         uid: `${NPC.PREFIX}01`,
     });
}
    

    /**
     * Call this to start the job. Usually called through interaction point.
     * @static
     * @param {alt.Player} player
     * @memberof Job
     */
     static async begin(player: alt.Player) {
        const openSpot = await FwJob.getVehicleSpawnPoint();
        if (!openSpot) {
            Athena.player.emit.notification(player, `~r~No room for vehicles right now. Please wait...`);
            return;
        }

        const randomPoints = FwJob.getRandomPoints(TOTAL_DROP_OFFS);
        const objectives: Array<Objective> = [];
        objectives.push({
            description: 'Steig in den Transporter',
            type: JobEnums.ObjectiveType.WAYPOINT,
            pos: openSpot.pos,
            range: 4,
            marker: {
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z - 1,
                },
                type: MARKER_TYPE.CYLINDER,
                color: new alt.RGBA(0, 255, 0, 100),
            },
            textLabel: {
                data: 'Steig in das Fahrzeug',
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z + 1.5,
                },
            },
            criteria:
                JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                JobEnums.ObjectiveCriteria.NO_DYING,
            callbackOnStart: (player: alt.Player) => {
                Athena.player.emit.message(player, '/quitjob - um den Job frühzeitig zu beenden.');
                Athena.player.emit.notification(player, `Steig in die Mule`);
            },
        });

        for (let i = 0; i < randomPoints.length; i++) {
            const rPoint = randomPoints[i];
            objectives.push({
                description: 'Packet abgeben',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint,
                range: 2,
                marker: {
                    pos: rPoint,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Abgabe Ort',
                    pos: {
                        x: rPoint.x,
                        y: rPoint.y,
                        z: rPoint.z + 1.0,
                    },
                },
                blip: {
                    text: 'Abgabe Ort',
                    color: 2,
                    pos: rPoint,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.NO_DYING |
                    JobEnums.ObjectiveCriteria.NO_VEHICLE |
                    JobEnums.ObjectiveCriteria.JOB_VEHICLE_NEARBY,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Fahre zum Auslieferungsort`);
                },
                callbackOnFinish: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Du hast das Packet abgeliefert!`);
                },
            });
        }

        objectives.push({
            description: 'Steig aus der Mule',
            type: JobEnums.ObjectiveType.WAYPOINT,
            pos: openSpot.pos,
            range: 4,
            marker: {
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z - 1,
                },
                type: MARKER_TYPE.CYLINDER,
                color: new alt.RGBA(0, 255, 0, 100),
            },
            blip: {
                text: 'Fahrzeug Parken',
                color: 2,
                pos: openSpot.pos,
                scale: 1,
                shortRange: true,
                sprite: 271,
            },
            textLabel: {
                data: 'Fahrzeug Parken',
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z + 1.5,
                },
            },
            criteria:
                JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                JobEnums.ObjectiveCriteria.NO_DYING,
            callbackOnStart: (player: alt.Player) => {
                Athena.player.emit.notification(player, `Fahre das Fahrzeug zurück`);
            },
            callbackOnFinish: (player: alt.Player) => {
                // Payout 100 - 200; Random;
                const earned = Math.floor(Math.random() * 180) + 250;
                Athena.player.currency.add(player, CurrencyTypes.CASH, earned);
                Athena.player.emit.notification(player, `~g~$${earned}`);
            },
        });

        const job = new Athena.systems.job.instance();
        job.addVehicle(
            player,
            'mule',
            openSpot.pos,
            openSpot.rot,
            new alt.RGBA(255, 255, 255, 255),
            new alt.RGBA(255, 255, 255, 255),
        );

        job.loadObjectives(objectives);
        job.addPlayer(player);
    }

    /**
     * Creates and checks if a vehicle is in a spot and returns a spot if it is open.
     * @static
     * @return {({ pos: alt.IVector3; rot: alt.IVector3 } | null)}
     * @memberof MuleJob
     */
    static async getVehicleSpawnPoint(): Promise<{ pos: alt.IVector3; rot: alt.IVector3 } | null> {
        for (let i = 0; i < JOB_DATA.PARKING_POINTS.length; i++) {
            const point = JOB_DATA.PARKING_POINTS[i];
            const pointTest = new alt.ColshapeSphere(point.pos.x, point.pos.y, point.pos.z - 1, 2);

            // Have to do a small sleep to the ColShape propogates entities inside of it.
            await new Promise((resolve: Function) => {
                alt.setTimeout(() => {
                    resolve();
                }, 250);
            });

            const spaceOccupied = alt.Vehicle.all.find((veh) => veh && veh.valid && pointTest.isEntityIn(veh));

            try {
                pointTest.destroy();
            } catch (err) {}

            if (spaceOccupied) {
                continue;
            }

            return point;
        }

        return null;
    }

    /**
     * Get random point from list of points.
     * @static
     * @return {Array<alt.IVector3>}
     * @memberof Job
     */
    static getRandomPoints(amount: number): Array<alt.IVector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_OFF_SPOTS[Math.floor(Math.random() * JOB_DATA.DROP_OFF_SPOTS.length)]);
        }

        return points;
    }
}
