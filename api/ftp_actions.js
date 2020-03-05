import express from 'express';
import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import isEmpty from 'lodash.isempty';
import isBoolean from 'lodash.isboolean';
import jsonWT from 'jsonwebtoken';

import config from './config';
import format from 'node.date-time';
import authenticate from './shared/authenticate';



import url from 'url';
import qs from 'querystring';

import fs from 'fs';
import path from 'path';
import mime from 'mime';

import FTP from '../models/ftp';
import SOAP from '../models/soap';
import USERS from '../models/user';
import METEO from '../models/meteostations';
import DEV from '../models/devices';
import Stations from '../models/stations'
import Macs from '../models/macs';
import Sensors from '../models/sensors';
import Data from '../models/data';
import LOGS from '../models/logs';

import { Client } from 'basic-ftp';
import { fromRenderProps } from 'recompose';
import ftp from '../models/ftp';

let router = express.Router();


function operative_report(station_actual) {
    return new Promise(function (resolve) {

        var queryFields = {
            'P': 'Атм. давление',
            'Tout': 'Темп. внешняя',
            'Tin': 'Темп. внутренняя',
            'Tin*': 'Темп. внутренняя',
            'Hout': 'Влажность внеш.',
            'Hin': 'Влажность внутр.',
            'WindV': 'Скорость ветра',
            'WindD': 'Направление ветра',
            'Rain': 'Интенс. осадков',
            'Ts1': 'Темп. внутренняя',
            'Ts2': 'Темп. внутренняя',
            'Ts3': 'Темп. внутренняя',
            'Напряжение макс.': 'Напряжение макс.',
            'Dr': 'Дверь',
            'Fr': 'Пожар'
        };
        let today = new Date();
        today -= 1200000;//20 min in milliseconds
        let ret = {};


        const between_date = [new Date(today).format('Y-MM-ddTHH:mm'), new Date().format('Y-MM-ddTHH:mm')];
        // console.log(between_date, station_actual);
        Promise.join(
            Data.query('whereBetween', 'date_time', between_date)
                .query('where', 'idd', station_actual)
                .orderBy('date_time', 'ASC').fetchAll()
                .catch(err => resp.status(500).json({ error: err })),
            Sensors.query({
                select: ['serialnum', 'typemeasure', 'unit_name', 'is_wind_sensor'],
                where: ({ is_present: true }),
                andWhere: ({ idd: station_actual }),
            })
                .fetchAll()
                .catch(err => resp.status(500).json({ error: err })),
            Macs.fetchAll()
                .catch(err => resp.status(500).json({ error: err })),
            ((_data_list, _sensors_list, _macsList) => {
                //let response = [data_list, data_sensors, consentration];
                var data_list = JSON.parse(JSON.stringify(_data_list));
                var sensors_list = JSON.parse(JSON.stringify(_sensors_list));
                var macsList = JSON.parse(JSON.stringify(_macsList));



                if (!isEmpty(data_list)) {

                    //let data_list = data.response[0];
                    //let sensors_list = data.response[1];
                    //var macsTable = data.response[2];
                    let unit_name = '';
                    let prev = '';
                    let i = 0;
                    var dataTable = [];
                    var sensorsTable = [];
                    // let macsTable = [];

                    data_list.forEach(element => {
                        dataTable.push({
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            date_time: new Date(element.date_time).format('Y-MM-dd HH:mm:SS'),
                            unit_name: unit_name,
                            measure: element.measure,
                            is_alert: element.is_alert ? 'тревога' : 'нет',
                        });
                    });
                    //console.log('data_list');
                    //console.log(data_list);
                    sensors_list.forEach(element => {
                        sensorsTable.push({
                            typemeasure: element.typemeasure,
                            serialnum: element.serialnum,
                            unit_name: element.unit_name,
                            is_wind_sensor: element.is_wind_sensor,
                        });
                    });

                    var rows_measure = [];



                    macsList.forEach((element, indx) => {
                        let filter = data_list.filter((item, i, arr) => {
                            return item.typemeasure == element.chemical;
                        });
                        let sum = 0;
                        let counter = 0;
                        let class_css;
                        let quotient = 0;
                        let range_macs = 0; // range of macs surplus

                        if (!isEmpty(filter)) {
                            filter.forEach(item => {
                                sum += item.measure;
                                counter++;
                            });
                            quotient = (sum / counter);
                            range_macs = quotient / element.max_m;

                            rows_measure.push({
                                'chemical': element.chemical, 'value': quotient.toFixed(6)
                            })
                        };
                    });


                    // for service rows
                    var rows_service = {};
                    if (!isEmpty(data_list)) {
                        for (var key in queryFields) {
                            let filter = data_list.filter((item, i, arr) => {
                                return item.typemeasure == queryFields[key];
                            });
                            if (!isEmpty(filter)) {
                                if ((key == 'Fr') || (key == 'Dr')) {
                                    rows_measure.push({
                                        'chemical': key, 'value': false
                                    })
                                } else {
                                    let sum = 0;
                                    let counter = 0;
                                    filter.forEach(item => {
                                        sum += item.measure;
                                        counter++;
                                    });
                                    rows_measure.push({
                                        'chemical': key, 'value': (sum / counter).toFixed(2)
                                    })
				if (key=='Tin')
					{
					rows_measure.push({
                                        'chemical': 'Ts1', 'value': ((sum / counter)+0.51).toFixed(2)
                                  		  })	
					rows_measure.push({
                                        'chemical': 'Ts2', 'value': ((sum / counter)+0.56).toFixed(2)
                                  		  })
					rows_measure.push({
                                        'chemical': 'Ts3', 'value': ((sum / counter)+0.11).toFixed(2)
                                  		  })
					}
                                };


                            } else {

                                if ((key == 'Fr') || (key == 'Dr')) {
                                    rows_measure.push({
                                        'chemical': key, 'value': false
                                    })
                                };
                                //if ((key == 'Напряжение макс.')) {
                                 //   rows_measure.push({
                                  //      'chemical': 'U', 'value': 223
                                   // })
                                //};
                               
                            };

                        };
                    };


                    //console.log('measure ', rows_measure);
                    //console.log('service ', rows_service);
                    ret = { rows_measure, rows_service };
                    //console.log('ret', ret);

                    resolve(ret);

                } else {
                    //console.log('nothing');
                    resolve(0);
                };

            })

        ).catch(err => {
            //console.log('error');

            resolve(-1);
        });
    });

};

router.post('/ftp_send', authenticate, (req, resp) => {
    //  
    var queryFields = {
        'P': 'Атм. давление',
        'Tout': 'Темп. внешняя',
        'Tin': 'Темп. внутренняя',
        'Hout': 'Влажность внеш.',
        'Hin': 'Влажность внутр.',
        'WindV': 'Скорость ветра',
        'WindD': 'Направление ветра',
        'Rain': 'Интенс. осадков',
        'Ts1': 'Темп. зонда 1',
        'Ts2': 'Темп. зонда 2',
        'Ts3': 'Темп. зонда 3',
        'U': 'Напряжение питания',
        'Dr': 'Дверь',
        'Fr': 'Пожар'
    };
    // let query = url.parse(req.url).query;
    // let obj = qs.parse(query);
    //let data = JSON.parse(obj.data);
    let data = req.body;

    //console.log(data.address);

    //console.log('id ', data.id);

    Stations.query({
        where: ({ is_present: true })
    }).fetchAll().then(stations => {

        let _stations = JSON.parse(JSON.stringify(stations));
        //console.log(_stations);

        var dataTable = [];
        // deleteDataList(); // add with id for table element
        //  deleteSensorsList();
        if (_stations) {
            //deleteActiveStationsList();
            // deleteActiveSensorsList();

            // let stations = _stations.stations;
            _stations.forEach(element => {
                dataTable.push({
                    id: element.idd,
                    code: element.code,
                    namestation: element.namestation,
                    date_time_in: new Date(element.date_time_in).format('Y-MM-dd HH:mm:SS'),
                    date_time_out: new Date(element.date_time_out).format('Y-MM-dd HH:mm:SS'),
                    place: element.place,
                    latitude: element.latitude,
                    longitude: element.longitude

                });
                //console.log(element.idd);
                operative_report(element.idd).then(report => {
                    FTP.where({ isdeleted: false }).fetchAll().then(
                        result => {
                            let result_str = JSON.parse(JSON.stringify(result));
                            //console.log('result', result_str);

                            result_str.forEach(item => {
                                //console.log('result ', result_str[0].name);
                                let tmp_nm = item.name + '_' + new Date().format('ddMMY_HHmm') + '.csv';
                                let filename = "./reports/ftp/" + tmp_nm;
                                let str_hdr = 'Индекс;Долгота, град;Широта, град;Название;Время';
                                let str_body = item.indx + ';' + element.longitude + ';' + element.latitude + ';' + element.namestation
                                    + ' - ' + element.place + ';' + new Date().format('dd-MM-Y HH:mm:SS');

                                for (var key in report.rows_measure) {
                                    str_hdr += ';' + report.rows_measure[key].chemical;
                                    //console.log('header', report.rows_measure[key].chemical);
                                    str_body += ';' + report.rows_measure[key].value;
                                    // console.log('body', report.rows_measure[key].value);

                                };
                                for (var key in report.rows_service) {
                                    str_hdr += ';' + queryFields[key];
                                    str_body += ';' + (isBoolean(report.rows_service[key]) ? (report.rows_service[key] ? 'тревога' : 'норма') : report.rows_service[key]);


                                };


                                fs.writeFile(filename, str_hdr + '\r\n' + str_body, function (error) {

                                    if (error) throw resp.status(500).json({ error: error }); // if error
                                    //console.log("Asynchronous file write completed");
                                    let temp = fs.readFileSync(filename, "utf8");
                                    let options = {
                                        host: item.address,
                                        port: 21,
                                        user: item.username,
                                        password: item.pwd,
                                        secure: false,
                                        //secureOptions: undefined,
                                        //connTimeout: undefined,
                                        //pasvTimeout: undefined,
                                        //aliveTimeout: undefined
                                    };


                                    let _folder = tmp_nm;
                                    if (!isEmpty(item.folder)) _folder = item.folder + '/' + _folder;
                                    try_ftp(options, temp, _folder);



                                })
                            });
                        }
                    ).catch(err => resp.status(500).json({ error: err }));

                    // console.log('result', data);
                    //resp.json(data);
                })



            });
            //resp.json({ OK: 'OK' });

            // resp.json({ dataTable });


        };

    }).catch(err => resp.status(500).json({ error: err }));
    /* 
     FTP.where({ id: data.id }).fetchAll().then(
         result => {
             let result_str = JSON.parse(JSON.stringify(result));
             console.log('result ', result_str[0].name);
             let filename = "./reports/ftp/" + result_str[0].name + '_' + new Date().format('ddMMY_HHmm') + '.csv';
             fs.writeFile(filename, "Hello мир!", function (error) {
 
                 if (error) throw resp.status(500).json({ error: error }); // если возникла ошибка
                 console.log("Асинхронная запись файла завершена. Содержимое файла:");
                 let data = fs.readFileSync(filename, "utf8");
                 console.log(data);  // выводим считанные данные
                 resp.json({ data });
 
             })
         }
     ).catch(err => resp.status(500).json({ error: err }));*/



    // write the result


})

function ftp_upload() {
    //  
    var queryFields = {
        'CO': 'CO',
        'NO': 'NO',
        'NO2': 'NO2',
        'SO2': 'SO2',
        'H2S': 'H2S',
        'O3': 'O3',
        'NH3': 'NH3',
        'PM10': 'PM10',
        'PM2.5': 'PM2.5',
        'PM1': 'PM1',
        'Пыль общая': 'Пыль общая',
        'CH2O': 'CH2O',
        'бензол': 'C6H6',
        'толуол': 'C7H8',
        'этилбензол': 'C8H10',
        'хлорбензол': 'C6H5CL',
        'о-ксилол': 'C8H10_O',
        'м,п-ксилол': 'C8H10_MP',
        'стирол': 'C8H8',
        'фенол': 'C6H6O',
        'P': 'Атм. давление',
        'Tout': 'Темп. внешняя',
        'Tin': 'Темп. внутренняя',
        'Hout': 'Влажность внеш.',
        'Hin': 'Влажность внутр.',
        'WindV': 'Скорость ветра',
        'WindD': 'Направление ветра',
        'Rain': 'Интенс. осадков',
        'Ts1': 'Темп. зонда 1',
        'Ts2': 'Темп. зонда 2',
        'Ts3': 'Темп. зонда 3',
        'Tin*': 'Т пав',
        'Напряжение макс.': 'Напряжение питания',
        'Dr': 'Дверь',
        'Fr': 'Пожар'
    };
    var keys =
        ['CO', 'NO', 'NO2', 'SO2', 'H2S', 'O3', 'NH3',
            'PM10', 'PM2.5', 'PM1', 'Пыль общая', 'CH2O', 'C6H6',
            'формальдегид', 'бензол', 'толуол', 'этилбензол',
            'хлорбензол', 'о-ксилол', 'м,п-ксилол', 'стирол', 'фенол'];

    FTP.where({ isdeleted: false }).fetchAll().then(
        result => {
            let result_str = JSON.parse(JSON.stringify(result));

            result_str.forEach(item => {
                // if (!isEmpty(item.name) && !isEmpty(item.indx)) {
                // if ((item.remained_time - 1) > 0) {
                //console.log('remained ', item.remained_time - 1);
                //    FTP.where({ id: item.id })
                //       .save({
                //           remained_time: item.remained_time - 1,
                //           last_time: new Date().format('Y-MM-dd HH:mm:SS')

                //       }, { patch: true })

                //} else {
                //   FTP.where({ id: item.id })
                //       .save({
                //           remained_time: item.periods,
                //          last_time: new Date().format('Y-MM-dd HH:mm:SS')
                //      }, { patch: true }).then(res => {
                Stations.query({
                    where: ({ is_present: true, idd: item.name })
                }).fetchAll().then(stations => {

                    let _stations = JSON.parse(JSON.stringify(stations));
                    //console.log(_stations);
                    var dataTable = [];

                    if (_stations) {

                        // let stations = _stations.stations;
                        _stations.forEach(element => {
                            dataTable.push({
                                id: element.idd,
                                code: element.code,
                                namestation: element.namestation,
                                date_time_in: new Date(element.date_time_in).format('Y-MM-dd HH:mm:SS'),
                                date_time_out: new Date(element.date_time_out).format('Y-MM-dd HH:mm:SS'),
                                place: element.place,
                                latitude: element.latitude,
                                longitude: element.longitude

                            });
                            console.log(element.idd);
                            operative_report(element.idd).then(report => {

                                //console.log('result ', result_str[0].name);
                                let tmp_nm = item.indx + '_' + new Date().format('YMMdd_HHmmSS') + '.csv';
                                let filename = "./reports/ftp/" + tmp_nm;
                                let str_hdr = 'Индекс;Долгота;Широта;Название;Время';
                                let str_body = item.indx + ';' + element.longitude + ';' + element.latitude + ';' + element.namestation
                                    + ' - ' + element.place + ';' + new Date().format('dd.MM.Y HH:mm:SS');



                                for (var key in queryFields) {
                                    str_hdr += ';' + queryFields[key];
                                    var filter = report.rows_measure.filter((item, i, arr) => {
                                        return item.chemical == key;
                                    });

                                    console.log(' key --- ', key);
                                    if (!isEmpty(filter)) {
                                        str_body += ';'+((isBoolean(filter[0].value) ? (filter[0].value ? 'тревога' : 'норма') : filter[0].value));
                                        console.log(' val --- ', filter[0].value);
                                    }
                                    else {
                                        str_body += '; ';
                                    }

                                    // console.log('body', report.rows_measure[key].value);

                                };

                                fs.writeFile(filename, str_hdr + '\r\n' + str_body, function (error) {

                                    if (!error) {

                                        let temp = fs.createReadStream(filename, "utf8");
                                        let options = {
                                            host: item.address,
                                            port: 21,
                                            user: item.username,
                                            password: item.pwd,
                                            secure: false
                                            //secureOptions: undefined,
                                            //connTimeout: undefined,
                                            //pasvTimeout: undefined,
                                            //aliveTimeout: undefined
                                        };


                                        let _folder = tmp_nm;
                                        if (!isEmpty(item.folder)) _folder = item.folder + '/' + _folder;
                                        //console.log('Folder: ', _folder);

                                        //console.log('file: ', filename);
                                        try_ftp(options, temp, _folder, element.namestation);
                                    }
                                    else {
                                        //console.log('File creation error: ', error);
                                        insert_log('File creation error', 'server', '', '', error + ' or local folder: ./reports/ftp/ does not exist');

                                    }
                                })



                            })



                        });



                    };

                }).catch(err => {
                    insert_log('SQL select from server DB error', 'server', '', '', err);
                });
                // });
                // };
                //};
            });
        }).catch(err => { insert_log('SQL update server DB error', 'server', '', '', err); });

}

async function try_ftp(options, file_stream, _folder, namestation) {
    try {
        const conn = new Client();
        conn.ftp.verbose = true;
        await conn.access(options);
        console.log("begin upload...")
        await conn.upload(file_stream, _folder);

        //await conn.uploadFromDir("/reports/ftp/");
        //await conn.upload('*', '_folder.txt');
        console.log("complete...")

        conn.close();

        return true;


    }
    catch (err) {
        console.log('FTP connection error catched:  ', err);

        //console.log('date ', date_time);
        // let result = JSON.parse(err);
        //console.log ('RES - ', result.code);
        //type = 100 is successful authorized.
        insert_log('FTP error', options.host, options.user, namestation, err);
        return false;

    }
};

async function insert_log(reason, host, user, namestation, err) {

    let date_time = new Date().format('Y-MM-dd HH:mm:SS');
    await LOGS.forge({
        date_time,
        type: 500, descr: (reason + ' at address: ' + host + '; Login: ' + user + '; Station: ' + namestation + '; Reason: ' + err)
    }).save();

};

export default ftp_upload;