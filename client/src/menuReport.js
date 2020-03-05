import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconMenu from 'material-ui/IconMenu';

import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';


import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';

import SvgIcon from '@material-ui/core/SvgIcon';

import WbCloudy from '@material-ui/icons/WbCloudy'
import BarChart from '@material-ui/icons/Equalizer';
import TimeLine from '@material-ui/icons/Timeline';
import Switch from '@material-ui/core/Switch';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import Tooltip from '@material-ui/core/Tooltip';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

import CheckBox from '@material-ui/icons/CheckBox';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';

import TextField from '@material-ui/core/TextField';


import { connect } from 'react-redux';

import isEmpty from 'lodash.isempty';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
//import htmlDocx from 'html-docx-js/dist/html-docx';
//import htmlTo from 'html2xlsx';
import { saveAs } from 'file-saver'
//import * as fs from 'level-filesystem';
import canvas2pdf from 'canvas2pdf/src/canvas2pdf';

import { dateAddReportAction } from './actions/dateAddAction';



const ITEM_HEIGHT = 48;

//window.html2canvas = html2canvas;

const styles = theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        flexWrap: 'wrap'
    },
    formControl: {
        margin: 2,
        minWidth: 160,
        padding:0
      },
      selectEmpty: {
        marginTop: theme.spacing.unit * 2,
      },
    icon: {
        margin: theme.spacing.unit * 2,
        color: blue[600],
        width: 30,
        height: 30,
        margin: 0
    },
    iOSSwitchBase: {
        '&$iOSChecked': {
            color: theme.palette.common.white,
            '& + $iOSBar': {
                backgroundColor: blue[600],
            },
        },
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.sharp,
        }),
    },
    iOSChecked: {
        transform: 'translateX(15px)',
        '& + $iOSBar': {
            opacity: 1,
            border: 'none',
        },
    },
    iOSBar: {
        borderRadius: 13,
        width: 42,
        height: 26,
        marginTop: -13,
        marginLeft: -21,
        border: 'solid 1px',
        borderColor: theme.palette.grey[400],
        backgroundColor: theme.palette.grey[50],
        opacity: 1,
        transition: theme.transitions.create(['background-color', 'border']),
    },
    iOSIcon: {
        width: 24,
        height: 24,
    },
    iOSIconChecked: {
        boxShadow: theme.shadows[1],
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 150,
    },textFieldWide: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 180,
    },
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
    },
    button: {
        margin: 0,
    },
    input: {
        display: 'none',
    }

});

function fnExcelReport() {
    var tab_text = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
    tab_text = tab_text + '<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';

    tab_text = tab_text + '<x:Name>Test Sheet</x:Name>';

    tab_text = tab_text + '<x:WorksheetOptions><x:Panes></x:Panes></x:WorksheetOptions></x:ExcelWorksheet>';
    tab_text = tab_text + '</x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body>';

    tab_text = tab_text + "<table border='1px'>";
    tab_text = tab_text + $('#myTable').html();
    tab_text = tab_text + '</table></body></html>';

    var data_type = 'data:application/vnd.ms-excel';
    
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        if (window.navigator.msSaveBlob) {
            var blob = new Blob([tab_text], {
                type: "application/csv;charset=utf-8;"
            });
            navigator.msSaveBlob(blob, 'Test file.xls');
        }
    } else {
        $('#test').attr('href', data_type + ', ' + encodeURIComponent(tab_text));
        $('#test').attr('download', 'Test file.xls');
    }

};


class MenuReport extends Component {

    constructor(props) {
        let isNll = false;
        super(props);

        const { fixedHeader,

            isStation,
            isLoading,
            snack_msg,
            value,
            options,
            meteoOptions,
            dateReportBegin,
            dateReportEnd,
            station_actual,
            stationsList,
            sensorsList,
            dataList,
            selected: [],
            sensors_actual,
            station_name, 
            report_type,
            data_4_report
        } = props;

        if (isStation) { isNll = true }

        this.state = {

            isStation: isNll,
            isLoading,
            snack_msg,
            value,
            anchorEl: null,
            options,
            meteoOptions,
            checked: [],

            dateReportBegin,
            dateReportEnd,
            station_actual,
            stationsList,
            sensorsList,
            dataList,
            selected: [],
            sensors_actual,
            station_name,
            report_type,
            data_4_report,
            chemical_list : ['NO', 'NO2', 'NH3', 'SO2', 'H2S', 'O3', 'CO', 'CH2O', 'PM1', 'PM2.5', 'PM10', 'Пыль общая',  'бензол', 'толуол', 'этилбензол', 'м,п-ксилол', 'о-ксилол', 'хлорбензол', 'стирол', 'фенол'   ],
            chemical:''
        };




        //this.handleClose = this.handleClose.bind (this);
        //this.handleClick = this.handleClick.bind (this);
        // this.handleChange = this.handleChange.bind (this);

    }

    translit = (_in) => {
    
    var transl = new Array();
    transl['А']='A';     transl['а']='a';
    transl['Б']='B';     transl['б']='b';
    transl['В']='V';     transl['в']='v';
    transl['Г']='G';     transl['г']='g';
    transl['Д']='D';     transl['д']='d';
    transl['Е']='E';     transl['е']='e';
    transl['Ё']='Yo';    transl['ё']='yo';
    transl['Ж']='Zh';    transl['ж']='zh';
    transl['З']='Z';     transl['з']='z';
    transl['И']='I';     transl['и']='i';
    transl['Й']='J';     transl['й']='j';
    transl['К']='K';     transl['к']='k';
    transl['Л']='L';     transl['л']='l';
    transl['М']='M';     transl['м']='m';
    transl['Н']='N';     transl['н']='n';
    transl['О']='O';     transl['о']='o';
    transl['П']='P';     transl['п']='p';
    transl['Р']='R';     transl['р']='r';
    transl['С']='S';     transl['с']='s';
    transl['Т']='T';     transl['т']='t';
    transl['У']='U';     transl['у']='u';
    transl['Ф']='F';     transl['ф']='f';
    transl['Х']='X';     transl['х']='x';
    transl['Ц']='C';     transl['ц']='c';
    transl['Ч']='Ch';    transl['ч']='ch';
    transl['Ш']='Sh';    transl['ш']='sh';
    transl['Щ']='Sch';    transl['щ']='sch';
    transl['Ъ']='';     transl['ъ']='';
    transl['Ы']='Y';    transl['ы']='y';
    transl['Ь']='';    transl['ь']='';
    transl['Э']='E';    transl['э']='e';
    transl['Ю']='Yu';    transl['ю']='yu';
    transl['Я']='Ya';    transl['я']='ya';

    var out = '';

    for(var i=0;i<_in.length;i++) {
        if(transl[_in[i]] != undefined) { out += transl[_in[i]]; }
        else { out += _in[i]; }
    }
    if (isEmpty(out) )
     {
            return _in;
     } 
     else
     {
            return out;
     }

    };

    daysInMonth = (month) => {
        let days = 33 - new Date(new Date().getFullYear(), month, 33).getDate();
        return days;

    };

    handleLocalChangeToggle = name => event =>{
       // const{meteoOptions} = this.props;
       // const{options} = this.props;

        this.props.handleChangeToggle (name, event);
       // this.setState({meteoOptions});
       // this.setState({options});

    };

    async createPDF(html) {
        let options = {
          html: html,
          fileName: 'test',
          directory: '/home/ilit/weather/test',
        };
    
       // let file = await RNHTMLtoPDF.convert(options)
        console.log(file.filePath);
      };
    handleClick = (name) => {

const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  if (this.props.report_type == 'operative'){
            var _html =  document.getElementById('operative_report');
            var dom = document.createElement('operative_report');
   };

   if (this.props.report_type == 'daily'){
            var _html =  document.getElementById('daily_report');
            var dom = document.createElement('daily_report'); 
    };

    if (this.props.report_type == 'monthly'){
        var _html =  document.getElementById('monthly_report');
        var dom = document.createElement('monthly_report'); 
};

if (this.props.report_type == 'tza4'){
    var _html =  document.getElementById('tza4_report');
    var dom = document.createElement('tza4_report'); 
};
dom.operative_report = _html;
let pdfHTML = _html.childNodes[0];
let canvas = doc.canvas;
canvas.height = 210;
canvas.width= 290;
canvas.style= {width: 290, height: 210};

const {dateReportEnd} = this.state;
//canvas.pdf = doc;

html2canvas(_html).then(function(_canvas) {
    //document.body.appendChild(_canvas);
  //doc.setPage(0);
  //doc.canvas=_canvas;

  // var iframe = document.createElement('iframe');
   //iframe.setAttribute('style','position:absolute;right:0; top:0; bottom:0; height:100%; width:500px');
   //document.body.appendChild(iframe);
   //iframe.src = _canvas;
   //  doc.output('save', 'OperativeReport_'+new Date(dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf');
    //doc.save('OperativeReport_'+new Date(dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf');


   ////// _canvas.toBlob((blob)=>{
   //////     saveAs(blob, 'OperativeReport_'+new Date(dateReportEnd).format('dd-MM-Y_H:mm')+'.png');
   ///// });

  /* var stream = blobStream();
    var ctx = canvas2pdf.PdfContext(stream);
   ctx.stream.on('finish', function () {
        var blob = ctx.stream.toBlob('application/pdf');
        saveAs(blob, 'OperativeReport_'+new Date(dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf', true);
    });
ctx.end();*/


});
var opt = {
    margin:       15,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 5 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };
  if (this.props.report_type =='operative')
     var worker = html2pdf().from(_html.innerHTML).set(opt).save('OperativeReport_Station_'+this.props.station_name+'_'+new Date(dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf');

  if (this.props.report_type =='daily')
    var worker = html2pdf().from(_html.innerHTML).set(opt).save('DailyReport_Station_'+this.props.station_name+'_'+new Date(dateReportEnd).format('dd-MM-Y')+'.pdf');

    if (this.props.report_type =='monthly')
    var worker = html2pdf().from(_html.innerHTML).set(opt).save('MonthlyReport_Station_'+this.props.station_name+'_'+new Date(dateReportEnd).format('MM-Y')+'.pdf');

    if (this.props.report_type =='tza4')
    var worker = html2pdf().from(_html.innerHTML).set(opt).save('TZA4_Report_Station_'+this.props.station_name+'_Substance_'+this.state.chemical+'_'+new Date(dateReportEnd).format('MM-Y')+'.pdf');


/*doc.fromHTML(pdfHTML,1,1,null,(obj)=>{
    var iframe = document.createElement('iframe');
    iframe.setAttribute('style','position:absolute;right:0; top:0; bottom:0; height:100%; width:500px');
    document.body.appendChild(iframe);
    iframe.src = doc.output ('datauristring');
    doc.output('save', 'OperativeReport_'+new Date(dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf');
    //doc.save('OperativeReport_'+new Date(this.state.dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf');
});*/
//html2pdf(pdfHTML[0], doc, (obj) =>{
  //doc.fromHTML(pdfHTML);      
 //   doc.save('OperativeReport_'+new Date(this.state.dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf');
//});
    
/*html2pdf(_html.innerHTML,doc,(doc)=>{
    var iframe = document.createElement('iframe');
    iframe.setAttribute('style','position:absolute;right:0; top:0; bottom:0; height:100%; width:500px');
    document.body.appendChild(iframe);
    iframe.src = doc.output ('datauristring');
    doc.output('save', 'OperativeReport_'+new Date(dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf');
    //doc.save('OperativeReport_'+new Date(this.state.dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf');
});*/

/*doc.addHTML (document.body).then((canvas)=>{
    doc.canvas = canvas;
 //this.createPDF(doc.innerHTML);
 doc.save('OperativeReport_'+new Date(this.state.dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf');
});*/

 
//html2canvas(dom).then((canv) =>{
        
  //  doc.save('OperativeReport_'+new Date(this.state.dateReportEnd).format('dd-MM-Y_H:mm')+'.pdf');});

  // doc.addHTML (_html).then((canvas)=>{
    //   doc.canvas = canvas;

    
}


async wrapReportGen  (params)  {
    var response = await(this.props.reportGen( {report:'operative', html: _html.innerHTML}));
return response;
}

handleWordClick = (name) => {
    const _html =  document.getElementById('operative_report');
const text ="12345465465";
const {dateReportEnd} = this.props;
var date ='';
var chemical = this.state.chemical;

if (this.props.report_type =='operative')
    date =new Date(dateReportEnd).format('dd-MM-Y_H:mm');

if (this.props.report_type =='daily')
    date =new Date(dateReportEnd).format('dd-MM-Y');

if (this.props.report_type =='monthly')
    date =new Date(dateReportEnd).format('MM-Y');

if (this.props.report_type =='tza4')
    date =new Date(dateReportEnd).format('MM-Y');


if (!isEmpty(this.props.data_4_report)) {

    this.props.reportGen( {report: this.props.report_type, station: this.props.station_name, date: date,data_4_report : this.props.data_4_report, chemical: this.translit(chemical)}).then(response =>{
    //var xhr = new XMLHttpRequest();

    var type = response.headers['content-type'];
    var filename = "";
    var disposition = response.headers['content-disposition'];

    if (disposition && disposition.indexOf('attachment') !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
    }
    //var blob = new File([response], filename, { type: type });
    var blob = new Blob([response.data], { type: type });

    saveAs(blob, filename);

   
    // var byteNumbers = new Uint8Array(response.length);

    //for (var i = 0; i < response.length; i++) {
    
     //   byteNumbers[i] = response.charCodeAt(i);
        
      //  }
      //  var blob = new Blob([byteNumbers], {type: 'text/html'});
       // saveAs(response, 'OperativeReport_'+new Date(dateReportEnd).format('dd-MM-Y_H:mm')+'.docx', false);
    });
 }
};

handleExcelClick = (name) => {
    
const {dateReportEnd} = this.props;
var date ='';
var chemical = this.state.chemical;

if (this.props.report_type =='operative')
    date =new Date(dateReportEnd).format('dd-MM-Y_H:mm');

if (this.props.report_type =='daily')
    date =new Date(dateReportEnd).format('dd-MM-Y');

if (this.props.report_type =='monthly')
    date =new Date(dateReportEnd).format('MM-Y');

if (this.props.report_type =='tza4')
    date =new Date(dateReportEnd).format('MM-Y');

 
 if (!isEmpty(this.props.data_4_report)) {

    this.props.reportXlsGen( {report: this.props.report_type, station: this.props.station_name, date: date,data_4_report : this.props.data_4_report, chemical: this.translit(chemical)}).then(response =>{
    //var xhr = new XMLHttpRequest();

    var type = response.headers['content-type'];
    var filename = "";
    var disposition = response.headers['content-disposition'];

    if (disposition && disposition.indexOf('attachment') !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
    }
    //var blob = new File([response], filename, { type: type });
    var blob = new Blob([response.data], { type: type });

    saveAs(blob, filename);

    });
 }

};

handleClose = () => {
        this.setState({ anchorEl: null });

    };
    handleChange = name => event => {
        if (this.props.checkedMeteo){
        const { options } = this.state;

        // indx = options.chemical.indexOf(name);
        for (var key in options) {
            if (options[key].chemical === name) {
                options[key]['visible'] = event.target.checked;

            };
        };
    
        this.setState({ options });
        this.props.hideLine({ options });

    } else {
        const { meteoOptions } = this.state;

        // indx = options.chemical.indexOf(name);
        for (var key in meteoOptions) {
            if (meteoOptions[key].header === name) {
                meteoOptions[key]['visible'] = event.target.checked;

            };
        };
    
        this.setState({ meteoOptions });
        this.props.hideLine({ meteoOptions });

    };
    };
    handleSelectChange = event => {
        const {stationsList} = this.props;
        let filter = stationsList.filter((item, i, arr) => {
            return item.namestation == event.target.value;});

        this.setState({ [event.target.name]: event.target.value });
        if(this.props.report_type == 'tza4'){
            if (!isEmpty(this.state.chemical)){
                this.props.handleReportChange({station_name: event.target.value,station_actual: filter[0].id,
                 chemical: this.state.chemical});
            }
        } else {
        if(!isEmpty(filter)) 
         this.props.handleReportChange({station_name: event.target.value,station_actual: filter[0].id});
        }
      };

    handleSelectChemicalChange = event => {
        const {stationsList} = this.props;
        const {station_name} = this.state;

        let filter = stationsList.filter((item, i, arr) => {
            return item.namestation == station_name;});

        this.setState({ [event.target.name]: event.target.value });
        if(!isEmpty(station_name)) 
        this.props.handleReportChange({station_name: station_name,station_actual: filter[0].id, chemical: event.target.value});
      };

      handlePickerChange = (event) => {
        const value = event.target.value;
        const id = event.target.id;
        if (this.props.report_type=='daily'){
            dateAddReportAction({ 'dateReportBegin': value + 'T00:00' });
            dateAddReportAction({ 'dateReportEnd': value + 'T23:59' });
            if (!isEmpty(this.props.station_name)){
            this.props.handleReportChange({station_name: this.props.station_name,station_actual: this.props.station_actual,
                'dateReportBegin': value + 'T00:00', 'dateReportEnd': value + 'T23:59', chemical: this.state.chemical});

        }
       }

       if (this.props.report_type=='monthly'){
           var dateReportBegin =new Date( new Date(value).getFullYear(), new Date(value).getMonth(), '1','0','0').format('Y-MM-ddTHH:mm');
           var dateReportEnd = new Date(new Date(value).getFullYear(), new Date(value).getMonth(), this.daysInMonth(new Date(value).getMonth()), '23','59').format('Y-MM-ddTHH:mm');
            dateAddReportAction({ 'dateReportBegin': dateReportBegin });
            dateAddReportAction({ 'dateReportEnd': dateReportEnd });

            if (!isEmpty(this.props.station_name)){
                this.props.handleReportChange({station_name: this.props.station_name,station_actual: this.props.station_actual,
                'dateReportBegin': dateReportBegin, 'dateReportEnd': dateReportEnd});

            }
         
        }

        if (this.props.report_type=='tza4'){
            var dateReportBegin =new Date( new Date(value).getFullYear(), new Date(value).getMonth(), '1','0','0').format('Y-MM-ddTHH:mm');
            var dateReportEnd = new Date(new Date(value).getFullYear(), new Date(value).getMonth(), this.daysInMonth(new Date(value).getMonth()), '23','59','59').format('Y-MM-ddTHH:mm:SS');
             dateAddReportAction({ 'dateReportBegin': dateReportBegin });
             dateAddReportAction({ 'dateReportEnd': dateReportEnd });
 
             if (!isEmpty(this.props.station_name)&&!isEmpty(this.state.chemical)){
                this.props.handleReportChange({station_name: this.props.station_name, station_actual: this.props.station_actual,
                'dateReportBegin': dateReportBegin, 'dateReportEnd': dateReportEnd, chemical: this.state.chemical});

              }
          
         }

    };

    componentWillMount() {
        var dateReportBegin =new Date().format('Y-MM-ddT00:00');
        var dateReportEnd = new Date().format('Y-MM-ddTHH:mm');
         dateAddReportAction({ 'dateReportBegin': dateReportBegin });
         dateAddReportAction({ 'dateReportEnd': dateReportEnd });
    };

    render() {

        const { classes } = this.props;
        const { anchorEl } = this.state;
        const {stationsList} = this.props;
        const {chemical_list} = this.state;
        let namestation ='';
        let filter = stationsList.filter((item, i, arr) => {
            return item.id == this.state.station_actual;});
            if(!isEmpty(filter))  namestation = filter[0].namestation;

            //console.log('menu '+stationsList);
        /*let { fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes,
            height
        } = this.props;*/
        return (
            <div>


                <Paper >

                    <nav className="navbar form-control">


                        <div className="navbar-header">
                        <form className={classes.root} autoComplete="off">
                        <FormControl className={classes.formControl}>

                            <InputLabel htmlFor="station_name" >Отчет по станции</InputLabel>

                                <Select
                                    value={this.state.station_name}
                                   onChange={this.handleSelectChange}
                                  inputProps={{
                                   name: 'station_name',
                                      id: 'station_name',
                                  }}>
                                {  (stationsList)&&// if not empty
                                        stationsList.map((option, i) => (
                                 <MenuItem key={option.namestation} value={option.namestation}>
                                        {option.namestation}
                                 </MenuItem>
                                 ))
                                }
                                 </Select>

                   
                        </FormControl>
                        </form>

                        </div>
                        {(this.state.report_type =='daily') && 
                        <TextField
                        id="dateReportBegin"
                        label="дата отчета"
                        type="date"
                        defaultValue= {new Date().format('Y-MM-dd')}
                        className={classes.textField}
                        // selectProps={this.state.dateReportBegin}
                        onChange={(event) => { this.handlePickerChange(event) }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />}

                    {(this.state.report_type =='monthly') && <TextField
                        id="dateReportBegin"
                        label="дата отчета"
                        type="month"
                        defaultValue= {new Date().format('Y-MM')}
                        className={classes.textFieldWide}
                        // selectProps={this.state.dateReportBegin}
                        onChange={(event) => { this.handlePickerChange(event) }}
                        InputLabelProps={{
                            shrink: true,
                        }}

                        
                    />}

                    {(this.state.report_type =='tza4') && <TextField
                        id="dateReportBegin"
                        label="дата отчета"
                        type="month"
                        defaultValue= {new Date().format('Y-MM')}
                        className={classes.textFieldWide}
                        // selectProps={this.state.dateReportBegin}
                        onChange={(event) => { this.handlePickerChange(event) }}
                        InputLabelProps={{
                            shrink: true,
                        }}

                        
                    />}
                   {(this.state.report_type =='tza4') &&  <form className={classes.root} autoComplete="off">
                   <FormControl className={classes.formControl}>
                   <InputLabel htmlFor="chemical" >примесь</InputLabel>
                              <Select
                                    value={this.state.chemical}
                                   onChange={this.handleSelectChemicalChange}
                                  inputProps={{
                                   name: 'chemical',
                                      id: 'chemical',
                                  }}>
                                     {   (stationsList)&& chemical_list.map((option, i) => (
                                 <MenuItem key={option} value={option}>
                                        {option}
                                 </MenuItem>
                                 ))
                                }
                              </Select>
                              </FormControl>
                              </form>}

                        <div className={classes.root}>
                            <Tooltip id="tooltip-charts-view3" title="Экспорт в PDF">
                            <IconButton className={classes.button} onClick = {this.handleClick} aria-label="Экспорт в PDF">

                            <SvgIcon className={classes.icon}>
                                    <path  d="M14,9H19.5L14,3.5V9M7,2H15L21,8V20A2,2 0 0,1 19,22H7C5.89,22 
                                    5,21.1 5,20V4A2,2 0 0,1 7,2M11.93,12.44C12.34,13.34 12.86,14.08
                                     13.46,14.59L13.87,14.91C13,15.07 11.8,15.35 10.53,15.84V15.84L10.42,15.88L10.92,14.84C11.37,13.97
                                      11.7,13.18 11.93,12.44M18.41,16.25C18.59,16.07 18.68,15.84 18.69,15.59C18.72,15.39 18.67,15.2
                                       18.57,15.04C18.28,14.57 17.53,14.35 16.29,14.35L15,14.42L14.13,13.84C13.5,13.32 12.93,12.41 
                                       12.53,11.28L12.57,11.14C12.9,9.81 13.21,8.2 12.55,7.54C12.39,7.38 12.17,7.3 
                                       11.94,7.3H11.7C11.33,7.3 11,7.69 10.91,8.07C10.54,9.4 10.76,10.13 11.13,11.34V11.35C10.88,12.23
                                        10.56,13.25 10.05,14.28L9.09,16.08L8.2,16.57C7,17.32 6.43,18.16 6.32,18.69C6.28,18.88 6.3,19.05
                                         6.37,19.23L6.4,19.28L6.88,19.59L7.32,19.7C8.13,19.7 9.05,18.75 10.29,16.63L10.47,16.56C11.5,16.23
                                          12.78,16 14.5,15.81C15.53,16.32 16.74,16.55 17.5,16.55C17.94,16.55 18.24,16.44 
                                          18.41,16.25M18,15.54L18.09,15.65C18.08,15.75 18.05,15.76 18,15.78H17.96L17.77,15.8C17.31,15.8
                                           16.6,15.61 15.87,15.29C15.96,15.19 16,15.19 16.1,15.19C17.5,15.19 17.9,15.44 
                                           18,15.54M8.83,17C8.18,18.19 7.59,18.85 7.14,19C7.19,18.62 7.64,17.96
                                            8.35,17.31L8.83,17M11.85,10.09C11.62,9.19 11.61,8.46 
                                    11.78,8.04L11.85,7.92L12,7.97C12.17,8.21 12.19,8.53 12.09,9.07L12.06,9.23L11.9,10.05L11.85,10.09Z"/>
                                </SvgIcon>
                                </IconButton>
                            </Tooltip>

                           

                            <Tooltip id="tooltip-charts-view4" title="Экспорт в Word">
                            <IconButton className={classes.button} onClick = {this.handleWordClick} aria-label="Экспорт в Word">
                                <SvgIcon className={classes.icon}>
                                    <path d="M6,2H14L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M13,3.5V9H18.5L13,
                                    3.5M7,13L8.5,20H10.5L12,17L13.5,20H15.5L17,
                                    13H18V11H14V13H15L14.1,17.2L13,15V15H11V15L9.9,17.2L9,13H10V11H6V13H7Z" />
                                </SvgIcon>
                                </IconButton>

                            </Tooltip>
                            <Tooltip id="tooltip-charts-view4" title="Экспорт в Excel">

                            <IconButton className={classes.button} onClick = {this.handleExcelClick} aria-label="Экспорт в Excel">
                                <SvgIcon className={classes.icon}>
                                    <path d="M6,2H14L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M13,3.5V9H18.5L13,
                                    3.5M17,11H13V13H14L12,14.67L10,13H11V11H7V13H8L11,15.5L8,18H7V20H11V18H10L12,16.33L14,
                                    18H13V20H17V18H16L13,15.5L16,13H17V11Z" />
                                </SvgIcon>
                                </IconButton>

                            </Tooltip>






                        </div>



                        <Snackbar
                            open={this.props.isLoading}
                            // TransitionComponent={<Slider direction="up" />}
                            autoHideDuration={3000}
                            onClose={this.props.handleSnackClose}

                            message={<span id="message-id">{this.props.snack_msg}</span>}

                        />
                    </nav>
                </Paper> <br /></div >
        );
    }
}
//<MenuItem key={option} selected={option === 'Pyxis'} onClick={this.handleClose}>
//   {option}
// </MenuItem>



function mapStateToProps(state) {
    return {
        /*  fixedHeader: state.fixedHeader,
          fixedFooter: state.fixedFooter,
          stripedRows: state.stripedRows,
          showRowHover: state.showRowHover,
          selectable: state.selectable,
          multiSelectable: state.multiSelectable,
          enableSelectAll: state.enableSelectAll,
          deselectOnClickaway: state.deselectOnClickaway,
          showCheckboxes: state.showCheckboxes,
          height: state.height*/


    };
}

MenuReport.propTypes = {

    classes: PropTypes.object.isRequired
}

export default (withStyles(styles)(MenuReport));