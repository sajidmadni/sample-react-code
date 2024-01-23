import React, { useState, useEffect } from 'react';
import {
    Button,
    Row,
    Col,
    UncontrolledTooltip,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    Form,
    DropdownItem
} from "reactstrap";
import { Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import emojis_icons from "../../../../../../images/emojis-icons.png";
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { connect } from "react-redux";
//actions
import {
    openNewThread
} from "../../../../../redux/SecureText/actions"

function ChatInput(props) {
    const [isFormSubmittedByBtn, setIsFormSubmittedByBtn] = useState(false);
    const imageFileType = ["image/jpeg", "image/png", "image/jpg"];
    const AllowedFileType = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    const MAX_IMAGE_FILE_SIZE = 5; //Mb
    const MAX_DOC_FILE_SIZE = 10; //Mb
    const DELIVER_AT_7AM = 4;
    const DELIVER_NOW = "DELIVER_NOW";
    const includeEmojis = ["search", "recent", "smileys", "people"];
    const [textMessage, settextMessage] = useState("");
    const [isOpen, setisOpen] = useState(false);
    const [isOpenAttachDD, setIsOpenAttachDD] = useState(false);
    const [attachedFileName, setAttachedFileName] = useState("file");
    const [isOpenScheduleDD, setIsOpenScheduleDD] = useState(false);
    const [receiptConfirmationType, setReceiptConfirmationType] = useState(DELIVER_NOW);
    const [receiptConfirmationTime, setReceiptConfirmationTime] = useState("");
    const [isNewChatOpen, setIsNewChatOpen] = useState(true);
    const [file, setfile] = useState({
        name: "",
        size: "",
        textMessage:""
    });
    const [fileImage, setfileImage] = useState({
        imageFile: "",
        size: "",
        textMessage: ""
    });

    useEffect(() => {
        var base_cc_h = $(".chat-conversation").height();
        var base_ci_h = $("#chat_input_box").height();
        var base_cil_mt = parseInt($("#chat-input-links").css('marginTop'));
        var base_i_m_mb = parseInt($("#input_msg").css('marginBottom'));

        $("#input_msg").on("keyup", function(e) {
            $(this).attr('style', 'height: 0 !important;');
            var input_scroll_h = parseInt($(this).prop('scrollHeight')) + 4;
            $(this).attr('style', 'height: '+input_scroll_h+'px !important;');

            var input_msg_h = $("#input_msg").height() - 28;

            var new_chat_converse_h = base_cc_h - input_msg_h;
            $(".chat-conversation").height(new_chat_converse_h+"px")

            var new_chat_in_h = base_ci_h + input_msg_h;
            $("#chat_input_box").height(new_chat_in_h+"px")

            var input_links_mt = base_cil_mt + input_msg_h;
            $("#chat-input-links").css('marginTop', input_links_mt+"px")

            var input_msg_mb = base_i_m_mb - input_msg_h;
            $("#input_msg").css('marginBottom',input_msg_mb+"px");
        });

    }, []);

    const toggle = () => setisOpen(!isOpen);
    const toggleOpenScheduleDD = () => setIsOpenScheduleDD(!isOpenScheduleDD);


    //function for text input value change
    const handleChange = e => {
        settextMessage(e.target.value)
        props.openNewThread(false);
    }

    useEffect(() => {
        if(props.isNewThreadOpen){
            settextMessage("");
            $("#fileupload").val('').clone(true);
            $('#OpenImgUpload').removeClass("attached");
            handleRemoveAttachment();
        }        
    },[textMessage, props.openNewThread, props.isNewThreadOpen]);
    
    const textfieldHandlekeyUp = (e) => {
        if (e.key === 'Enter' && e.altKey) { 
            if(e.target.value === ""){
                alert("Can not send empty message");
            } else {
                setIsFormSubmittedByBtn(!isFormSubmittedByBtn);
                $("#submit_message").click();
            }
        }
    }

    useEffect(() => {
        settextMessage(textMessage)
    },[textMessage]);

    //function for add emojis
    const addEmoji = e => {
        let emoji = e.native;
        settextMessage(textMessage + emoji)
        setisOpen(!isOpen);
    };

    const handleScheduleClick = e => {
        if(!isOpenScheduleDD){
            setIsOpenScheduleDD(!isOpenAttachDD);
            setTimeout(function(){
                $("#timepicker").val($("#receipt_confirmation_time").val());
            }, 500);
        }
    }

    const handleChangeSchedule = e => {
        handleSetSchedule(DELIVER_AT_7AM, $("#timepicker").val());
    }

    //function for file input change
    const handleFileAttachClick = e => {
        let file = false;
         if($("#fileupload")[0].files.length != 0){
            file = $('#fileupload')[0].files[0];
        }

        if(isOpenAttachDD && e){
            setIsOpenAttachDD(!isOpenAttachDD);
        }else if(!file){
            $('#OpenImgUpload').removeAttr('data-toggle');
            $('#fileupload').trigger('click');
            $('#OpenImgUpload').removeClass("attached");
        }else{
            setIsOpenAttachDD(!isOpenAttachDD);
            if (file){
                setAttachedFileName(file.name);
                $('#OpenImgUpload').addClass("attached");
            }
        }
    }

    const handleRemoveAttachment = e => {
        $("#fileupload").val('').clone(true);
        $('#OpenImgUpload').removeClass("attached");

        // reset image / file
        setfileImage({ imageFile: "", size: "", textMessage: "" });
        setfile({name: "", size: "", textMessage: ""})
    }

    const handleReplaceAttachment = e => {
        $("#fileupload").val('').clone(true);
        $('#OpenImgUpload').removeClass("attached");
        // reset image / file
        setfileImage({ imageFile: "", size: "", textMessage: "" });
        setfile({name: "", size: "", textMessage: ""})

        handleFileAttachClick();
    }

    //function for file input change
    const handleFileChange = e => {
        e.preventDefault();
        let file = false;
        if($("#fileupload")[0].files.length != 0){
            file = $('#fileupload')[0].files[0];
            if(AllowedFileType.indexOf(file.type) == -1){
                $('#fileupload').val("");
                alert("Unsupported file selected.");
                return false;
            }
            setAttachedFileName(file.name);
            $('#OpenImgUpload').addClass("attached");
            if(imageFileType.indexOf(file.type) != -1){
                if(file.size/ 1024 / 1024 <= MAX_IMAGE_FILE_SIZE){
                    setfileImage({
                        imageFile: URL.createObjectURL(file),
                        size: file.size
                    });
                }else {
                    alert("Image size must be less than "+ MAX_IMAGE_FILE_SIZE +" Mb.");
                    $("#fileupload").val('').clone(true);
                    $('#OpenImgUpload').removeClass("attached");
                }
            }else {
                if(file.size/ 1024 / 1024 <=  MAX_DOC_FILE_SIZE){
                    setfile({
                        name: file.name,
                        size: file.size
                    })
                }else {
                    alert("File size must be less than "+ MAX_DOC_FILE_SIZE +" Mb.");
                    $("#fileupload").val('').clone(true);
                    $('#OpenImgUpload').removeClass("attached");
                }
            }
        }else {
            //setIsOpenAttachDD(!isOpenAttachDD);
        }
    }

    const changeSubmitValBtn = (e) => {
        setIsFormSubmittedByBtn(!isFormSubmittedByBtn);
    }

    //function for send data to onaddMessage function(in userChat/index.js component)
    const onaddMessage = (e, textMessage) => {
        e.preventDefault();
        // Internet Explorer 6-11
        const isIE = /*@cc_on!@*/false || !!document.documentMode;
        if(isIE && fileImage.imageFile !== ""){
            $('#OpenImgUpload').addClass("attached");
        }

        if($(".unreadLabel").length){
            $(".unreadLabel").closest("li").remove();
        }

        if(textMessage == "" && isFormSubmittedByBtn && (fileImage.imageFile == "" && file.name == "")){
            alert("Can not send empty message");
            setIsFormSubmittedByBtn(!isFormSubmittedByBtn);
            return false;
        }
        
        if(!isIE && e.nativeEvent.submitter.id != "submit_message"){
            return false;
        }
        if(isIE){
            if(!isFormSubmittedByBtn){
                return false;
            }
        }

        var textMessage = textMessage.trim();

        let isFileMsg = false;
        if (file.name !== "") {

            isFileMsg = true;
            file.textMessage = textMessage;
            props.onaddMessage(file, "fileMessage");
            setfile({name: "", size: "", textMessage: ""})
            settextMessage("");
            $("#fileupload").val('').clone(true);
            $('#OpenImgUpload').removeClass("attached");
            handleRemoveAttachment();
        }

        if (fileImage.imageFile !== "") {
            isFileMsg = true;
            fileImage.textMessage = textMessage;
            props.onaddMessage(fileImage, "imageMessage");
            setfileImage({ imageFile: "", size: "", textMessage: "" });
            settextMessage("");
            $("#fileupload").val('').clone(true);
            $('#OpenImgUpload').removeClass("attached");
            handleRemoveAttachment();
        }

        if (textMessage !== "" && !isFileMsg) {
            props.onaddMessage(textMessage, "textMessage");
            $("#fileupload").val('').clone(true);
            $('#OpenImgUpload').removeClass("attached");
            settextMessage("");
            handleRemoveAttachment();
        }
        setIsFormSubmittedByBtn(!isFormSubmittedByBtn);
        clearSchedule();
    }

    const handleSetSchedule = (deliveryType, deliveryTime) => {
            setReceiptConfirmationType(deliveryType);
            setReceiptConfirmationTime(deliveryTime);
            $('#OpenSchedule').addClass("selectedNotify");
    }

    const doNothing = (e) => {
        event.preventDefault();
        $("#timepicker").val("");
        return false;
    }

    const clearSchedule = e => {
        setReceiptConfirmationType(DELIVER_NOW);
        setReceiptConfirmationTime("");
        setIsOpenScheduleDD(false);
        $('#OpenSchedule').removeClass("selectedNotify");
    }

    const closeSchedule = e => {
        setIsOpenScheduleDD(false);
    }


    return (
        <React.Fragment>

            <div id="chat_input_box" className="p-3 p-lg-4 border-top mb-0" >
                <Form onSubmit={(e) => onaddMessage(e, textMessage)} id="messageFormId">
                    <Row noGutters>
                        <Col>
                            <div id="input_wrapper">
                                <textarea id="input_msg" value={textMessage} onChange={handleChange} onKeyUp={textfieldHandlekeyUp} rows="1" className="form-control form-control-lg bg-light border-light messasge-chat-input" placeholder="Enter Message..." ></textarea>
                            </div>
                            <div id="chat-input-links" className="chat-input-links ms-md-2">
                                <ul className="list-inline mb-0 ms-0">
                                    <div style={{ float: "left"}}>
                                        <li className="list-inline-item">
                                            <ButtonDropdown className="emoji-dropdown" direction="up" isOpen={isOpen} toggle={toggle}>
                                                <DropdownToggle id="emoji" color="link" className="text-decoration-none font-size-16 btn-lg waves-effect">
                                                    <i className="ri-emotion-happy-line"></i>
                                                </DropdownToggle>
                                                <DropdownMenu className="dropdown-menu-end">
                                                    <Picker onSelect={addEmoji} include={includeEmojis}  native="true"  />
                                                </DropdownMenu>
                                            </ButtonDropdown>
                                            <UncontrolledTooltip target="emoji" placement="top">
                                                Emoji
                                                        </UncontrolledTooltip>
                                        </li>
                                        <li className="list-inline-item input-file">
                                            <input type="file" name="fileInput" onChange={(e) => handleFileChange(e)} id="fileupload" style={{ display: "none"}} accept="image/jpg,image/jpeg,image/png,application/pdf"/>
                                            <ButtonDropdown id="attachement_dd" isOpen={isOpenAttachDD} toggle={(e) => handleFileAttachClick(e)} className="align-self-start attachment-action" direction="up" >
                                                <DropdownToggle id="OpenImgUpload" tag="button" className="text-decoration-none font-size-16 btn-lg waves-effect btn btn-link attachment-button">
                                                    <i className="ri-attachment-line"></i>
                                                    <span id="" className="attachment-count">1</span>
                                                </DropdownToggle>
                                                <DropdownMenu >
                                                    <DropdownItem onClick={(e) => handleRemoveAttachment(e)}>Remove <span className="file_attached_name">{attachedFileName}</span></DropdownItem>
                                                    <DropdownItem onClick={(e) => handleReplaceAttachment(e)}>Replace file</DropdownItem>
                                                </DropdownMenu>
                                            </ButtonDropdown>
                                            <UncontrolledTooltip target="OpenImgUpload" placement="top">
                                                Attach
                                            </UncontrolledTooltip>
                                        </li>
                                        {
                                            !props.isGroup &&
                                            <li className="list-inline-item">
                                                <input type="hidden" name="receipt_confirmation_type" id="receipt_confirmation_type" value={receiptConfirmationType} />
                                                <input type="hidden" name="receipt_confirmation_time" id="receipt_confirmation_time" value={receiptConfirmationTime} />
                                                <ButtonDropdown id="delivered-at" isOpen={isOpenScheduleDD} toggle={(e) => handleScheduleClick(e)} className="align-self-start schedule-action" direction="up" >
                                                    <DropdownToggle id="OpenSchedule" tag="button" className="text-decoration-none font-size-16 btn-lg waves-effect btn btn-link schedule-button">
                                                        <i className="fa-2x fa fa-clock-o" id="receiptConfirmationClock"></i>
                                                        <span className="caret"></span>
                                                        <span id="" className="selected_tick"><i className="fas fa-check"></i></span>
                                                    </DropdownToggle>
                                                    <DropdownMenu >
                                                        <DropdownItem>
                                                            <input type="time" onChange={ (e) => handleChangeSchedule(e) } onBlur={ (e) => handleChangeSchedule(e) } style={{ width:"91px" }}  id="timepicker" name="timepicker" />
                                                            <button style={{ height: "39px", border: "0px", width: "30px", fontSize: "16px" }}  onClick={ (e) => clearSchedule(e) } type="reset">&times;</button>
                                                        </DropdownItem>
                                                        <DropdownItem onClick={ (e) => closeSchedule(e) }>Close</DropdownItem>
                                                    </DropdownMenu>
                                                </ButtonDropdown>
                                                <UncontrolledTooltip target="OpenSchedule" placement="top">
                                                    Schedule Notification
                                                </UncontrolledTooltip>
                                            </li>
                                        }
                                    </div>
                                    <div style={{ float: "right"}}>
                                        <li className="list-inline-item">
                                            <span className='chat-submit-bottom-text'>Press Alt + Enter to send</span>
                                        </li>
                                        <li className="list-inline-item submit-button-li" style={{float: "right"}}>
                                            <Button id="submit_message" type="submit" onClick={(e) => changeSubmitValBtn()} color="primary" className="font-size-16 btn-lg chat-send waves-effect waves-light submit-chat-message-btn">
                                                <i className="ri-send-plane-2-fill"></i>
                                            </Button>
                                            <UncontrolledTooltip target="submit_message" placement="top">
                                                Send
                                            </UncontrolledTooltip>

                                        </li>
                                    </div>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>
        </React.Fragment>
    );
}

const mapStateToProps = (state) => {    
    const { isNewThreadOpen } = state.secureText.Layout;
    return { isNewThreadOpen };
};

export default connect(mapStateToProps, {openNewThread})(ChatInput);
// export default ChatInput;