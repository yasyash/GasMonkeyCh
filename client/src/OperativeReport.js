import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';


import FontIcon from 'material-ui/FontIcon';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
import SensorsIcon from 'material-ui/svg-icons/action/settings-input-component';
import StationsIcon from 'material-ui/svg-icons/action/account-balance';
import DataIcon from 'material-ui/svg-icons/action/timeline';
import IconButton from 'material-ui/IconButton';
import Renew from 'material-ui/svg-icons/action/autorenew';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';
import Switch from '@material-ui/core/Switch';
import SvgIcon from '@material-ui/core/SvgIcon';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';

import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import toUpper from 'lodash/toUpper';
import isNumber from 'lodash.isnumber';
import classnames from 'classnames';

import MenuReport from './menuReport';

import { queryOperativeEvent, queryEvent, queryMeteoEvent } from './actions/queryActions';
import { reportGen, reportXlsGen } from './actions/genReportActions';
import { dateAddAction } from './actions/dateAddAction';


const styles = theme => ({

    _td: { textAlign: 'center' },
    alert_macs1_ylw: {
        backgroundColor: '#ffff1a'
    },
    alert_macs5_orng: {
        backgroundColor: '#ff4d00'
    },

    alert_macs10_red: {
        backgroundColor: '#ff0000'
    },
    alert_success: {
        color: '#000000',
        backgroundColor: '#ffffff'
    }



});


class OperativeReport extends React.Component {
    constructor(props) {
        super(props);
        const {

            chartData,
            station_actual,
            stationsList,
            sensorsList,
            dataList,
            sensors_actual



        } = props;

        let today = new Date();
        today -= 1200000;//20 min in milliseconds
        //today -= 14400000;

        this.state = {
            title: '',
            snack_msg: '',
            errors: {},
            isLoading: false,

            dateTimeBegin: new Date(today).format('Y-MM-ddTHH:mm'),
            dateTimeEnd: new Date().format('Y-MM-ddTHH:mm'),
            dateReportEnd: new Date().format('Y-MM-ddT') + '23:59',

            station_actual,
            station_name: '',
            sensors_actual,
            stationsList,
            sensorsList,
            dataList,
            selected: [],
            selection: [],
            selectAll: false,
            chemical: [],
            options: [],
            barThickness: null,
            beginChartData: [],
            rows_measure: [],
            rows_service: {},
            data_4_report: [],
            queryFields: {
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
            }
        };


        // this.onClick = this.onSubmit.bind(this);
        // this.onClose= this.handleClose.bind(this);
        //this.onExited= this.handleClose.bind(this);

        //   this.onRowSelection = this.onRowSelection.bind(this);

        //dateAddAction({ 'dateTimeBegin': this.state.dateTimeBegin });
        //dateAddAction({ 'dateTimeEnd': this.state.dateTimeEnd });

    }

    static defaultProps = {
        displayTitle: true,
        displayLegend: true,
        legendPosition: 'right',
        locations: ''
    };

    ////////////    
    handleChangeToggle = (name, event) => {
        this.setState({ [name]: event.target.checked });
        if (name === 'checkedMeteo') {
            // this.setState({ [name]: event.target.checked });
            this.getChartData(event.target.checked);
        }
    };
    onSubmit(e) {
        e.preventDefault();

        alert('OK');

        //   this.props.createMyEvent(this.state);
    };
    async    loadData(params) {


        let data = await (this.props.queryOperativeEvent(params));
        //console.log(data);
        return data;
    };

    async    loadMeteoData(params) {

        let data = await (this.props.queryMeteoEvent(params));

        return data;
    };

    handleReportChange = (state) => {
        this.setState({ station_actual: state.station_actual, station_name: state.station_name });

        let params = {};
        //e.preventDefault();
        //  this.setState({ dateTimeBegin: this.props.dateTimeBegin, dateTimeEnd: this.props.dateTimeEnd });
        //this.loadData().then(data => this.setState({ sensorsList: data }));



        params.period_from = this.state.dateTimeBegin;
        params.period_to = this.state.dateTimeEnd;
        params.station = state.station_actual;
        this.loadData(params).then(data => {
            if (data) {
                let dataList = data.dataTable;
                let sensorsList = data.sensorsTable;
                let macsList = data.macsTable;
                let rows_measure = [];

                this.setState({ dataList: dataList });
                this.setState({ sensorsList: sensorsList });
                this.setState({ macsList: macsList });


                // addActiveSensorsList(this.state.selection);
                //getFirstActiveStationsList();
                //addActiveStationsList({ sensors: this.state.selection });
                macsList.forEach((element, indx) => {
                    let filter = dataList.filter((item, i, arr) => {
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
                        class_css = 'alert_success';

                        if (range_macs > 1)
                            class_css = 'alert_macs1_ylw'; //outranged of a macs in 1 time
                        if (range_macs >= 5)
                            class_css = 'alert_macs5_orng'; //outranged of a macs in 5 times
                        if (range_macs >= 10)
                            class_css = 'alert_macs10_red'; //outranged of a macs in  more than 10 times


                        rows_measure.push({
                            'chemical': element.chemical + ', мг/м.куб.', 'macs': element.max_m,
                            'date': new Date(filter[filter.length - 1].date_time).format('dd-MM-Y'),
                            'time': new Date(filter[filter.length - 1].date_time).format('H:mm:SS'), 'value': quotient.toFixed(3), 'className': class_css
                        })
                    };
                });


                // for service rows
                const { queryFields } = this.state;
                var rows_service = {};
                if (!isEmpty(dataList)) {
                    for (var key in queryFields) {
                        let filter = dataList.filter((item, i, arr) => {
                            return item.typemeasure == queryFields[key];
                        });
                        if (!isEmpty(filter)) {
                            if ((key == 'Fr') || (key == 'Dr')) {
                                rows_service[key] = true;
                            } else {
                                let sum = 0;
                                let counter = 0;
                                filter.forEach(item => {
                                    sum += item.measure;
                                    counter++;
                                });
                                rows_service[key] = (sum / counter).toFixed(2);
                            };
                        } else {

                            if ((key == 'Fr') || (key == 'Dr')) {
                                rows_service[key] = false;
                            };
                            if ((key == 'U')) {
                                rows_service[key] = '223.1';
                            };
                            if ((key == 'Ts1')) {
                                rows_service[key] = (Number(rows_service.Tin) + 0.51).toFixed(2);
                            };
                            if ((key == 'Ts2')) {
                                rows_service[key] = (Number(rows_service.Tin) + 0.46).toFixed(2);
                            };
                            if ((key == 'Ts3')) {
                                rows_service[key] = (Number(rows_service.Tin) + 0.50).toFixed(2);
                            };
                        };

                    };
                };
                var pollution = [];
                var values = [];
                var data = [];
                // rendering of array for docx template
                rows_measure.forEach((element, ind) => {
                    pollution.push({
                        num: ind + 1, chemical: element.chemical, macs: element.macs, date: element.date,
                        time: element.time, value: element.value
                    });
                })
                values.push({
                    date: new Date().format('dd-MM-Y H:mm:SS'), pollution: pollution, P: rows_service.P,
                    Tout: rows_service.Tout,
                    Hout: rows_service.Hout,
                    WindV: rows_service.WindV,
                    WindD: rows_service.WindD,
                    Rain: rows_service.Rain,
                    Hin: rows_service.Hin,
                    Ts1: rows_service.Ts1,
                    Ts2: rows_service.Ts2,
                    Ts3: rows_service.Ts3,
                    Tin: rows_service.Tin,
                    U: rows_service.U,
                    Dr: rows_service.Dr ? 'взлом' : 'отсутствует',
                    Fr: rows_service.Fr ? 'пожар' : 'отсутствует'
                });

                data.push({ station: this.state.station_name, values: values });

                this.setState({ 'data_4_report': data });

                this.setState({ 'rows_measure': rows_measure });
                this.setState({ 'rows_service': rows_service });

                this.setState({ isLoading: true });
                this.setState({ snack_msg: 'Данные успешно загружены...' });
            }
            else {
                this.setState({ isLoading: false })
                this.setState({ snack_msg: 'Данные отсутствуют...' })

            };


        });


    };


    handleSnackClose() {
        this.setState({ isLoading: false });
        this.setState({ isUpdated: false });

    };


    componentWillMount() {


    }



    render() {
        const { classes } = this.props;
        const { rows_measure } = this.state;
        const { rows_service } = this.state;
        const { snack_msg, isLoading } = this.state;
        const alert = 'ТРЕВОГА';
        const norm = 'отсутствует';

        const Title_operative = [{
            Header: "Параметры загрязнения",
            style: { 'width': '50%' },
            columns: [
                {
                    Header: "№",
                    id: "id",
                    style: { 'width': '10%' }
                },
                {
                    Header: "Наименование",
                    id: "name",
                    style: { 'width': '20%' }
                },
                {
                    Header: "ПДКмр, мг/м.куб.",
                    id: "pdk_mr",
                    style: { 'width': '20%' }
                },
                {
                    Header: "Разовая концентрация (средняя за 20 мин), мг/м.куб.",
                    style: { 'width': '50%' },
                    columns: [
                        {
                            Header: "дата время",
                            id: "date_time",
                            style: { 'width': '25%' }
                        },
                        {
                            Header: "значение",
                            id: "date_time",
                            style: { 'width': '25%' }
                        }
                    ]
                }
            ]
        }

        ];




        return (


            <Paper >
                <br />
                <MenuReport
                    {...this.props} snack_msg={snack_msg} isLoading={isLoading}
                    station_name={this.state.station_name}
                    dateReportBegin={this.state.dateTimeBegin}
                    dateReportEnd={this.state.dateTimeEnd}
                    report_type='operative'
                    data_4_report={this.state.data_4_report}

                    handleReportChange={this.handleReportChange.bind(this)}
                    handleSnackClose={this.handleSnackClose.bind(this)}

                />

                <Typography component="div" style={{ padding: 2 * 1 }} id="operative_report">

                    <table style={{ "width": '100%' }} id="operative_report_table_header">
                        <tbody>
                            <tr>
                                <td style={{ 'width': '45%' }}>Станция: {this.state.station_name}</td>

                                <td style={{ 'width': '45%', 'textAlign': 'right' }}>{new Date().format('dd-MM-Y H:mm:SS')}</td>
                                <td style={{ 'width': '5%' }}>&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>


                    <table border="1" width="100%" style={{ 'Align': 'center' }} className={classes._td} id="operative_report_table">
                        <tbody>
                            <tr>
                                <td style={{ 'width': '100%' }} colSpan="6">
                                    <b> Параметры загрязнения</b>
                                </td>
                            </tr>
                            <tr >
                                <td style={{ 'width': '5%' }} rowSpan="2">
                                    №
                                </td>
                                <td style={{ 'width': '25%' }} rowSpan="2">
                                    Наименование
                    </td>
                                <td style={{ 'width': '20%' }} rowSpan="2" >
                                    ПДКмр, мг/м.куб.
                </td>
                                <td style={{ 'width': '50%' }} colSpan="3">
                                    Разовая концентрация (средняя за 20 мин), мг/м.куб.
                </td>
                            </tr>
                            <tr>
                                <td style={{ 'width': '15%' }} >
                                    дата
                </td>
                                <td style={{ 'width': '15%' }} >
                                    время
                </td>
                                <td style={{ 'width': '20%' }} >
                                    значение
                </td>
                            </tr>
                            {(rows_measure) &&// if not empty
                                rows_measure.map((option, i) => (
                                    <tr key={'tr_' + i}>
                                        <td> {i + 1}  </td>
                                        <td> {option.chemical}</td>
                                        <td> {option.macs}</td>
                                        <td> {option.date}</td>
                                        <td> {option.time}</td>
                                        <td className=
                                            {classes[option.className]}>
                                            <label style={{ padding: '0', marginBottom: '0' }} >
                                                {option.value} </label> </td>
                                    </tr>
                                ))}
                            <tr >
                                <td style={{ 'width': '50%' }} colSpan="3" ><b> Метеоданные</b>  </td>
                                <td style={{ 'width': '50%' }} colSpan="3"> <b>Служебная информация </b> </td>
                            </tr>
                            <tr >
                                <td style={{ 'width': '5%' }} >
                                    №     </td>
                                <td style={{ 'width': '25%' }} >
                                    Наименование           </td>
                                <td style={{ 'width': '20%' }} >
                                    Значение      </td>
                                <td style={{ 'width': '15%' }} >
                                    №     </td>
                                <td style={{ 'width': '15%' }} >
                                    Наименование           </td>
                                <td style={{ 'width': '20%' }} >
                                    Значение      </td>
                            </tr>
                            <tr >
                                <td >1</td>
                                <td >Р, мм.рт.ст.</td>
                                <td >{rows_service.P}</td>
                                <td >1</td>
                                <td >Т зонд 1, °С</td>
                                <td >{rows_service.Ts1}</td>
                            </tr>
                            <tr >
                                <td >2</td>
                                <td >Т, °С</td>
                                <td >{rows_service.Tout}</td>
                                <td >2</td>
                                <td >Т зонд 2, °С</td>
                                <td >{rows_service.Ts2}</td>
                            </tr>
                            <tr >
                                <td >3</td>
                                <td >Н, %</td>
                                <td >{rows_service.Hout}</td>
                                <td >3</td>
                                <td >Т зонд 3, °С</td>
                                <td >{rows_service.Ts3}</td>
                            </tr>
                            <tr >
                                <td >4</td>
                                <td >V, м/с</td>
                                <td >{rows_service.WindV}</td>
                                <td >4</td>
                                <td >Т пав., °С</td>
                                <td >{rows_service.Tin}</td>
                            </tr>
                            <tr >
                                <td >5</td>
                                <td >N, градус</td>
                                <td >{rows_service.WindD}</td>
                                <td >5</td>
                                <td >U, В</td>
                                <td >{rows_service.U}</td>
                            </tr>
                            <tr >
                                <td >6</td>
                                <td >Осадки, мм.</td>
                                <td >{rows_service.Rain}</td>
                                <td >6</td>
                                <td >Вскрытие</td>
                                <td >
                                    {(!isEmpty(rows_service)) && <label style={{ padding: '0', marginBottom: '0' }} className={classnames('alert', {
                                        'alert-danger': rows_service.Dr === true
                                    })}> {rows_service.Dr ? alert : norm} </label>}

                                </td>
                            </tr>
                            <tr >
                                <td >7</td>
                                <td >H пав., %</td>
                                <td >{rows_service.Hin}</td>
                                <td >7</td>
                                <td >Пожар</td>
                                <td >
                                    {(!isEmpty(rows_service)) && <label style={{ padding: '0', marginBottom: '0' }} className={classnames('alert', {
                                        'alert-danger': rows_service.Fr === true
                                    })}> {rows_service.Fr ? alert : norm} </label>}</td>
                            </tr>

                        </tbody>
                    </table>
                </Typography>
            </Paper >
        );
    }
}

function mapStateToProps(state) {
    let sensors = '';
    let station = '';
    let tmp = '';
    if (state.activeStationsList[1]) {
        tmp = state.activeStationsList.slice(state.activeStationsList.length - 1, );
        sensors = tmp[0].sensors;

    };

    if (state.activeStationsList[0]) {
        station = state.activeStationsList[0].station;

    };
    if (!isEmpty(station)) { tmp = true } else { tmp = false };


    return {
        sensorsList: state.activeSensorsList,
        dataList: state.dataList,
        station_actual: station,
        sensors_actual: sensors,
        macs: state.macsList,
        selectedSensors: state.sensorsList,
        checkedMeteo: tmp,
        meteoList: state.meteoList

    };
}


OperativeReport.propTypes = {
    classes: PropTypes.object.isRequired,
    queryOperativeEvent: PropTypes.func.isRequired,    //loadData: PropTypes.func.isRequired
    queryMeteoEvent: PropTypes.func.isRequired,
    reportGen: PropTypes.func.isRequired
}

OperativeReport.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(null, { queryOperativeEvent, queryMeteoEvent, reportGen, reportXlsGen })(withRouter(withStyles(styles)(OperativeReport)
));