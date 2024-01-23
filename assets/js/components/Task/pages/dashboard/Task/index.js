import React, {Component, useState, useRef } from 'react';
import { connect } from "react-redux";
import * as actionCreators from "../../../../../redux/Task/actions";
import { useEffect } from 'react';
import SelectContact from "../../../../SecureText/components/SelectContact";
import LoadingSpinner from "../../../../SecureText/components/LoadingSpinner";

// Bootstarp Imports
import {
    Modal, 
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "react-bootstrap";
// MUI Imports
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import Person from '@material-ui/icons/PeopleAlt';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Avatar from '@material-ui/core/Avatar';
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CreateIcon from '@material-ui/icons/Create';

const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  button: {
    '&:hover': {
      backgroundColor: 'rgb(0 0 0 / 21%)'
    }
  }
}));

const SearchButton = () => (
    <Button variant="outlined" size="small" endIcon={<SendIcon />}>
        Create
    </Button>
)

const GreenCheckbox = withStyles({
    root: {
      color: green[400],
      '&$checked': {
        color: green[600],
      },
    },
    checked: {},
  })((props) => <Checkbox color="default" {...props} />);

function Index(props) {
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState(false);
    const [taskModalShow, setTaskModalShow] = React.useState(false);
    const [assigneeModalShow, setAssigneeModalShow] = React.useState(false);
    const [searchloading, setSearchloading] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [searchContacts, setSearchContacts] = React.useState(false);
    const [searchKeywords, setSearchKeywords] = React.useState("");
    const [isFirstTimePageLoad, setIsFirstTimePageLoad] = React.useState(false);
    const [selectedContact, setSelectedContact] = React.useState([]);
    const [closeOnClick, setCloseOnClick] = React.useState(false);
    const [assigneeBtnText, setAssigneeBtnText] = React.useState("Assignee");
    const [assigneeVal, setAssigneeVal] = React.useState(0);
    const [isDisabledCreateTaskBtn, setIsDisabledCreateTaskBtn] = React.useState(true);
    const [stateChecked, setStateChecked] = React.useState(false);
    const [taskTextValue, setTaskTextValue] = React.useState("");
    const [showSnackNotification, setShowSnackNotification] = React.useState(false);
    const [notificationMessage, setNotificationMessage] = React.useState("");
    const [notificationSeverity, setNotificationSeverity] = React.useState("success");
    const [panelExpanded, setPanelExpanded] = React.useState("");
    const [taskRemarksTextValue, setTaskRemarksTextValue] = React.useState("");
        

    const handleTaskModalClose = () => setTaskModalShow(false);
    const handleTaskModalShow = () => {
        // setTaskTextValue("");
        clearAssigneeFilter();
        setTaskModalShow(true);
    }

    // Show assignee modal
    const contactsToggle = () => setAssigneeModalShow(true);
    const handleContactsModalClose = () => {
        setSearchKeywords("");
        setAssigneeModalShow(false);
    }

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };


    const [value, setValue] = useState();
    const [editingValue, setEditingValue] = useState(value);

    const [displayContacts, setDisplayContacts] = useState("none");

    const onChange = (event) => setEditingValue(event.target.value);

    const onKeyDown = (event) => {
        if (event.key === "Enter" || event.key === "Escape") {
        event.target.blur();
        }
    };

    const onBlur = (event) => {
        if (event.target.value.trim() === "") {
        setEditingValue(value);
        } else {
        setValue(event.target.value);
        }
    };

    const textareaRef = useRef();

    useEffect(() => {
        props.fetchSmartTasks();
        //setRandomQuote();
        //this.setCurrentUserId();
      }, []);

    // Complete task
    const handleComplete = (event) => {
        let taskId = event.target.value;
        let remarks = null;
        let obj = {
            task_id: taskId,
            remarks: remarks
        };
        let returnVal =  props.completeSmartTask(obj);
        
        Promise.resolve(returnVal).then(value=>{
            setNotificationSeverity("success");
            setNotificationMessage('Task has been completed successfully');
            setShowSnackNotification(true);
            // setPanelExpanded(taskId);
            // setExpanded(taskId);
            setExpanded(isExpanded ? taskId : false);
            
            // Open the remarks field for editing
            //$("#task-"+taskId).addClass("task-expand");
            // Set id for open inline edit
            //this.setState({ expandableListId: taskId });
        });
        
    };

    const handleContactSearch = (e) => {

        if(e.target.value.length > 2 || e.target.value.length === 0){
            setSearchloading(true);
            setLoading(true);            
            setTimeout(function(){ 
                setSearchloading(false);
            }.bind(this), 1000);

            setSearchContacts(false);
            setSearchKeywords(e.target.value);
            setIsFirstTimePageLoad(false);
        } else{
            setSearchContacts(false);
            setSearchKeywords("");
            setIsFirstTimePageLoad(false);
        }
    };
    const handleBlockTextField = (e) => {
        e.preventDefault();
    };

    const handleContactClick = ({event}, contactId, contactName, presence) => {
        if(isNaN(contactId)){
            setNotificationSeverity("error");
            setNotificationMessage('Groups are not allowed to select as assignee');
            setShowSnackNotification(true);
        }else{
            $("#assignee_id").val(contactId);
            $(".dropdown-toggle.assignee-btn").addClass("assigned-btn");
            setAssigneeBtnText("Assigned: "+ contactName);
            setAssigneeVal(contactId);
            setAssigneeModalShow(false);            
            $(".assigneeIcon").removeClass("hideAssigneeClear");
            $(".assigneeIcon").addClass("show-assignee-clear");
        }
    };

    const clearAssigneeFilterOnly = () => {
        $(".assigneeIcon").removeClass("show-assignee-clear");
        $(".assigneeIcon").addClass("hideAssigneeClear");
        setAssigneeBtnText("Assignee");
        setAssigneeVal(0);
    };

    const onTaskTextChange = (e) => {
        let enterdValue = e.target.value;
        enterdValue = enterdValue.trim();

        if(enterdValue !== ""){
            let totalEnteredChar = enterdValue.length;
            if(totalEnteredChar > 300){                
                //$("#task-input-description").show();
                //setIsDisabledCreateTaskBtn(true);
                setNotificationSeverity("error");
                setNotificationMessage("There is a maximum of 300 characters available for a task.");
                setShowSnackNotification(true);  
                return false;
            } else {
                $("#task-input-description").hide();
                setIsDisabledCreateTaskBtn(false);
                setTaskTextValue(e.target.value);
            }
        } else {
            setTaskTextValue(e.target.value);
            // setIsDisabledCreateTaskBtn(false);
        }
    };

    const submitTask = ({target}) => {
        let taskValue = taskTextValue.trim();
        if(taskValue.length == 0){
            setNotificationSeverity("error");
            setNotificationMessage("You can't create empty task.");
            setShowSnackNotification(true);  
            return false;
        }
        if(taskValue.length > 300){
            setNotificationSeverity("error");
            setNotificationMessage("There is a maximum of 300 characters available for a task.");
            setShowSnackNotification(true);  
            return false;
        }

        let descriptionVal = taskValue;
        let isStatVal = 0;
        if(!stateChecked){
            isStatVal = 0;
        } else {
            isStatVal = 1;
        }

        let obj = {
            description: descriptionVal,
            isStat: isStatVal,
            assigneeId: (assigneeVal == 0 ? props.current_user_id : assigneeVal)
        };
        // return false;
        $("#task_description").val("");
        $(".fa-exclamation").removeClass("item_important_icon_active");
        let returnVal = props.createSmartTask(obj);
        Promise.resolve(returnVal).then(value=>{
            // Highlight the recent added task for few seconds
            $("#task-"+value.payload.id).addClass('highlight-recent');
            setTimeout(function () {
                $("#task-"+value.payload.id).removeClass('highlight-recent');
            }, 5000);
            // Set active All on left side navigation
            $(".dropdown-item").removeClass("active")
            $("#ALL").addClass("active");
            
            setNotificationMessage('Task has been created successfully');
            setNotificationSeverity("success");
            setShowSnackNotification(true);
        })
        clearAssigneeFilter();
        setTaskModalShow(false);
    }

    const clearAssigneeFilter = () => {
        $("#standard-name").val("");
        $(".assigneeIcon").removeClass("show-assignee-clear");
        $(".assigneeIcon").addClass("hideAssigneeClear");
        setAssigneeBtnText("Assignee");
        setAssigneeVal(0);
        setStateChecked(false);
        setTaskTextValue("");
        setIsDisabledCreateTaskBtn(false);
        // Remove toggle label color class
        $(".MuiFormControlLabel-label").removeClass("priority-color");
        // Hide error message 
        $("#task-input-description").hide();
    }

    const toggleStatChange = (event) => {
        let makeNewStat = false;
        if(!stateChecked){
            makeNewStat = true;
        } else {
            makeNewStat = false;
        }
        // this.setState(
        //     {
        //         [event.target.name]: event.target.checked,
        //         isStat: makeNewStat
        //     });
        setStateChecked(makeNewStat);
    }

    const handleNotificationClose = (event, reason) => {
        // if (reason === 'clickaway') {
        //   return;
        // }    
        setShowSnackNotification(false);
    };

    const handSaveRemarks = (event, tid) => {
        let val = $("#remarks-text-"+tid).val().trim();        
        if(val.length == 0){
            setNotificationSeverity("info");
            setNotificationMessage("Empty remarks can't be saved.");
            setShowSnackNotification(true);  
            return false;
        }
        if(val.length > 300){                
            setNotificationSeverity("error");
            setNotificationMessage('There is a maximum of 300 characters available for remarks.');
            setShowSnackNotification(true);  
            return false;
        }
        let taskId = tid;
        let obj = {
            task_id: taskId,
            remarks: val,
            isSeparate: true
        };
        props.completeSmartTask(obj);
        setTimeout(function(){
            setNotificationSeverity("success");
            setNotificationMessage('Remarks has been updated successfully.');
            setShowSnackNotification(true);            
        }, 1000);
    }

    const onTaskRemarksTextChange = (e) => {

        let inputElementId = e.target.id.split('-');
        let taskid = inputElementId[2];
        
        if(e.target.value.trim() !== ""){
            let totalEnteredChar = e.target.value.length;
            if(totalEnteredChar > 300){
                $("#task-input-description").show();
                setNotificationSeverity("error");
                setNotificationMessage('There is a maximum of 300 characters available for remarks.');
                setShowSnackNotification(true);  
                return false;
            } else {
                setTaskRemarksTextValue(e.target.value);
                $('#submit-remarks-'+taskid).attr("disabled", false);
            }
        } else {
            $('#submit-remarks-'+taskid).attr("disabled", false);
        }
    };
      

    return( 
        <React.Fragment>            
            <div className="row left-content-wrapper">
            <div className="col-md-12" style={{ background : ' white', paddingTop: "30px", height: "100%" }}>
                <div className="page-content page-container" id="page-content">
                    <div className="row d-flex ml-100"> 
                        <div className="col-md-9">                              
                            <div className="row d-flex"> 
                                {
                                    (props.filteredTasksList.length > 0) ?
                                    <div>
                                        {
                                            props.filteredTasksList.map((selTask, taskKey) =>                                                                                    
                                                <Accordion
                                                    expanded={expanded === selTask.id}
                                                    onChange={handleChange(selTask.id)}
                                                    id={"accordian-main-"+selTask.id}
                                                    key={selTask.id}
                                                    className={selTask.completed_at !== null ? "task-complete-border" : [(selTask.is_stat ? "task-stat-border" : "task-pending-border")]}
                                                >                                                
                                                    <AccordionSummary
                                                        expandIcon={<ExpandMoreIcon />}
                                                        aria-controls="panel1bh-content"
                                                        id={"task-"+selTask.id}                                                    
                                                    >
                                                        {
                                                            selTask.completed_at === null ?
                                                            <FormControlLabel 
                                                            control={
                                                                    <GreenCheckbox 
                                                                    id="1" 
                                                                    name="checkedG" 
                                                                    fontSize="small" 
                                                                    onChange={handleComplete}
                                                                    value={selTask.id} 
                                                                    />} 
                                                            />
                                                            :
                                                            <CheckIcon fontSize="large" style={{ color: green[500], margin: "27px 21px 10px 21px" }} />
                                                        }
                                                        
                                                        <Typography component={'span'} className={"typegraphyClassName "+classes.secondaryHeading}>
                                                            {selTask.description}
                                                        </Typography>
                                                        <Typography component={'span'} className={classes.heading}>
                                                            <Card >
                                                                <CardHeader
                                                                    avatar={
                                                                    <Avatar
                                                                        aria-label="recipe"
                                                                        src={selTask.assignee == 0 ? "/physicians/getPhysicianImg/"+ selTask.creator : "/physicians/getPhysicianImg/"+ selTask.assignee}
                                                                    />
                                                                    }
                                                                    title={selTask.assignee_name}
                                                                    subheader={selTask.created_at}
                                                                />
                                                            </Card>
                                                        </Typography>                                    
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        {
                                                            selTask.completed_at === null ? <label>To submit remarks, please complete the task first!</label> :
                                                            <Typography className="task-description" component={'span'}>
                                                                <TextField
                                                                    id={"remarks-text-"+selTask.id}
                                                                    label="Completion Remarks"
                                                                    placeholder="Enter completion remarks ..."
                                                                    multiline
                                                                    defaultValue={selTask.completion_remarks == "null" ? "" : selTask.completion_remarks}
                                                                    onChange={onTaskRemarksTextChange}
                                                                    // value={taskRemarksTextValue}
                                                                    // value={selTask.completion_remarks == "null" ? "" : selTask.completion_remarks}
                                                                    InputProps={{endAdornment: <Button variant="outlined" size="small" id={"submit-remarks-"+selTask.id}  onClick={(e) => { handSaveRemarks(e, selTask.id);}}  endIcon={<CreateIcon />}>Write </Button>}}
                                                                />
                                                                <div style={{color: "green", marginTop: "12px", fontSize: "10px"}}>Completed at: {selTask.completed_at}</div>
                                                            </Typography>
                                                            
                                                        }
                                                        
                                                    
                                                    </AccordionDetails>
                                                </Accordion>
                                            )
                                        }
                                    </div>
                                    :
                                    <div className="nothing_left">
                                            <blockquote>
                                                { props.quotes[0].quote }
                                            </blockquote>
                                    </div>
                                }                                
                            </div>
                        </div>
                        <div className="col-md-3" style={{paddingRight: "35px", textAlign: "right"}}>
                            <Fab size="small" color="primary" aria-label="add" onClick={handleTaskModalShow}>
                                <AddIcon />
                            </Fab>
                            <input type="hidden" id="assignee_id" value={assigneeVal} />
                        </div>
                    </div>
                </div>
            </div>
            {/* Create Task Modal */}
            <Modal
                className="create-task-modal"
                show={taskModalShow}
                onHide={handleTaskModalClose}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body >
                    <div className="create-task-area">
                        <TextField
                            id="standard-name"
                            label="Task"
                            className="input-task-area"
                            placeholder="e.g. Contact patient at 7pm"
                            multiline
                            InputProps={{endAdornment: <Button variant="outlined" size="small" onClick={submitTask} endIcon={<SendIcon />}>Create </Button>}}
                            onChange={onTaskTextChange}
                            value={taskTextValue}
                        />
                        <div id="task-input-description" className="priority-color" style={{ marginTop: "2px", fontSize: "13px", display: "none" }}>
                            There is a maximum of 300 characters available for a task.
                        </div>
                        <div className="create-task-items">
                            <Button variant="outlined" size="small" className="dropdown-toggle.assignee-btn" startIcon={<Person />} onClick={contactsToggle}>
                                {assigneeBtnText}
                            </Button>
                            <a href="#" className="assigneeIcon hideAssigneeClear" onClick={clearAssigneeFilterOnly}>
                                <i className="far fa-times-circle"></i>
                            </a>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={stateChecked}
                                        value={stateChecked}
                                        onChange={toggleStatChange}
                                        name="stateChecked"
                                        size="small"
                                        className="stat-switch-toggle"
                                        inputProps={{ 'aria-label': 'secondary checkbox', 'id':'toggleBtn' }}
                                    />
                                }
                                label="Mark as Stat"
                                id="toggleBtnLabel"
                            />
                        </div> 
                        {/* <div className="search-load-contacts" >
                            <TextField id="filled-search" label="Search Contacts" type="search" InputLabelProps={{ shrink: true }}  />
                        </div> */}
                    </div>
                </Modal.Body>
            </Modal>

            {/* Assignee Modal */}
            <Modal
                className="create-task-modal"
                show={assigneeModalShow}
                onHide={handleContactsModalClose}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton className='assigneeModalHeader'>
                    <input 
                        type="text" 
                        className="form-control assignee-modal-search-field" 
                        placeholder="Please enter 3 or more characters to search contacts" 
                        onKeyUp={handleContactSearch}
                        onCopy={handleBlockTextField}
                        onPaste={handleBlockTextField}  
                        onDrag={handleBlockTextField}  
                        onDrop={handleBlockTextField}  
                        autoComplete="off"
                    />
                </Modal.Header>
                <Modal.Body className="p-4" style={{maxHeight: 'calc(100vh - 210px)', overflowY: 'auto'}}>
                    {
                        isFirstTimePageLoad || searchKeywords === "" || searchKeywords.length > 2  ?
                        <div>
                            {
                                searchloading ? <LoadingSpinner /> : 
                                <SelectContact
                                    args={{loading: loading, searchKeywords: searchKeywords, selectedContact: selectedContact, isSideBar:true}}
                                    // handleCheck={handleCheck}
                                    // handleSearchVal={onHandleSearchVal}
                                    // searchKeywords={searchKeywords}
                                    handleContactClick={handleContactClick}
                                />
                            }
                        </div>
                        : "Please enter 3 or more characters to search contacts"
                    }                    
                </Modal.Body>
            </Modal>

            <Snackbar 
            open={showSnackNotification}
            onClose={handleNotificationClose}
            autoHideDuration={2000} 
            className="snakbar-text-siz"
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            >
                <Alert  severity={notificationSeverity}>
                    {notificationMessage}
                </Alert>
            </Snackbar>

        </div>
        </React.Fragment>
    );
}

// export default Index;
const mapStateToProps = (state) => {
    const { tasks, filteredTasksList, quotes, current_user_id } = state.smartTasks.Task;
    return { tasks, filteredTasksList, quotes, current_user_id };
};

export default (connect(mapStateToProps, actionCreators)(Index));
// export default Index;