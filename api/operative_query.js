import express from 'express';
import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import jsonWT from 'jsonwebtoken';
import config from './config';

import authenticate from './shared/authenticate';

import commonValidations from './shared/validations';
import Stations from '../models/stations';
import Sensors from '../models/sensors';
import Data from '../models/data';
import Macs from '../models/macs';
import User from '../models/user';
import Logs from '../models/logs';

import date from 'date-and-time';
import url from 'url';
import qs from 'querystring';

let router = express.Router();



router.get('/', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    //  if (query) {
    //    obj = JSON.parse(decodeURIComponent(query))
    //}
    const between_date = [data.period_from, data.period_to];
    //     console.log('data ', between_date);


    Promise.join(
        Data.query('whereBetween', 'date_time', between_date)
            .query('where', 'idd', data.station)
            .orderBy('date_time', 'ASC').fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        Sensors.query({
            select: ['serialnum', 'typemeasure', 'unit_name', 'is_wind_sensor'],
            where: ({ is_present: true }),
            andWhere: ({ idd: data.station }),
        })
            .fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        Macs.fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        ((data_list, data_sensors, consentration) => {
            let response = [data_list, data_sensors, consentration];
            resp.json({ response });
        })

    )

        .catch(err => resp.status(500).json({ error: err }));


    //'whereIn', 'serialnum', data.sensors,


});

router.get('/all', authenticate, (req, resp) => {
    //  

    let query = url.parse(req.url).query;
    let obj = qs.parse(query);
    let data = JSON.parse(obj.data);
    //  if (query) {
    //    obj = JSON.parse(decodeURIComponent(query))
    //}
    const between_date = [data.period_from, data.period_to];
    const between_wide_date = [ new Date().format('Y-MM-ddT00:00'), data.period_to];// from begin of day
    //console.log('data ', between_wide_date);


    Promise.join(
        Data.query('whereBetween', 'date_time', between_date)
            .orderBy('date_time', 'ASC').fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        Sensors.query({
            select: ['serialnum', 'typemeasure', 'unit_name', 'is_wind_sensor'],
            where: ({ is_present: true }),

        })
            .fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        Macs.query('where', 'max_m', '>',0).orderBy('chemical', 'ASC').fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        Logs.query('whereBetween', 'date_time', between_wide_date)
            .orderBy('date_time', 'DESC').fetchAll()
            .catch(err => resp.status(500).json({ error: err })),
        ((data_list, data_sensors, consentration, logs_list) => {
            let response = [data_list, data_sensors, consentration, logs_list];
            resp.json({ response });
        })

    )

        .catch(err => resp.status(500).json({ error: err }));


    //'whereIn', 'serialnum', data.sensors,


});
//  andWhereBetween: ('date_time_in', {[data.period_from, data.period_to]} )
router.post('/', authenticate, (req, resp) => {
    //  const {dateTimeBegin, dateTimeEnd} = req.body;
    //consol.log('query in');
    Stations.query({
    }).fetchAll().then(stations => {
        resp.json({ stations });
    })
        .catch(err => resp.status(500).json({ error: err }));



})

export default router;