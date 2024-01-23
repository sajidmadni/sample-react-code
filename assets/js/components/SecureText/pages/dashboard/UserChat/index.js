import React, { useState,useEffect, useRef, useCallback } from 'react';
import {
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    UncontrolledDropdown,
    Modal,
    ModalHeader,
    ModalBody,
    CardBody
} from "reactstrap";
import { connect } from "react-redux";

import SimpleBar from "simplebar-react";

import { withRouter } from 'react-router-dom';

//Import Components
import UserProfileSidebar from "../../../../SecureText/components/UserProfileSidebar";
import UserHead from "./UserHead";
import ImageList from "./ImageList";
import ChatInput from "./ChatInput";
import FileList from "./FileList";
// import ArrowUpwardOutlined from '@mui/icons/ArrowUpwardOutlined';
import DoubleArrowRoundedIcon from '@material-ui/icons/DoubleArrowRounded';

//actions
import {
    openUserSidebar,
    updateTempGroup,
    setMessagesThread,
    setActiveGroupReadStatus,
    createTempSingleChat,
    updateTempSingleChat,
    pollChatData,
    loadGroup,
    setActiveTab,
    activeUser,
    fetchMessagesThread,
    setUsersLastUnreadMessageId,
    setUsersLastTopMessageId
} from "../../../../../redux/SecureText/actions";

//Import Images
import avatar4 from "../../../../../../images/users/avatar-4.jpg";

//i18n
import { useTranslation } from 'react-i18next';
import ContactPresence from "../../../components/ContactPresence";
import LoadingSpinner from "../../../components/LoadingSpinner";
import AjaxLoadingSpinner from "../../../components/AjaxLoadingSpinner";
import {USE_TIME_FORMAT} from "../../../../../constants/general";
// Toaster
import { ToastContainer, toast, Slide } from 'react-toastify';
const initialLoadMore = false;
const initialOffset = 0;
const initialState = 0;

function UserChat(props) {
    const ref = useRef();
    const ref2 = useRef(null);

    const [modal, setModal] = useState(false);
    const [showStatusBar, setShowStatusBar] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [coveringStatus, setCoveringStatus] = useState("");
    const [coveringContact, setCoveringContact] = useState("");
    const [attachmentLoadingModal, setAttachmentLoadingModal] = useState(false);
    const [showLoader, setShowLoader] = useState(true);
    const [apiCompleted, setApiCompleted] = useState(true);
    const [showArrowIcon, setShowArrowIcon] = useState(false);
    const [isSendSingleMessage, setIsSendSingleMessage] = useState(false);
    const [isThreadOpen, setIsThreadOpen] = useState(false);

    const loaderRef = useRef(showLoader)
    const PAGE_LIMIT = props.page_per_limit;
    const executeScroll = () => {
        if(ref2.current){
            console.log({ref2})
            ref2.current.scrollIntoView();
            $("#scrollToUnreadText").css("display", "none");
        }
        // $("#scrollToUnreadText").css("display", "none");
    }

    /* intilize t variable for multi language implementation */
    const { t } = useTranslation();

    //userType must be required
    const [ allUsers ] = useState(props.recentChatList);

    const [ chatMessages, setChatMessages ] = useState(props.recentChatList[props.active_user].messages);

    // Open modal for message loading
    const toggleAttachmentLoadingModal = () => setAttachmentLoadingModal(!attachmentLoadingModal);

    const [loadMoreData, setLoadMoreData] = useState(initialLoadMore);
    const [loadMoreNewData, setLoadMoreNewData] = useState(initialLoadMore);
    const propsUnreadMessageStatus = props.usersLastUnreadMessageId[props.active_user] && props.usersLastUnreadMessageId[props.active_user] > 0 ? true : false;
    const [isMoreBottomPagination, setIsMoreBottomPagination] = useState(true);
    const [isMoreTopPagination, setMoreTopPagination] = useState(true);
    const [isAPICallSend, setIsAPICallSend] = useState(true);
    const [pagelimit, setPagelimit] = useState(PAGE_LIMIT);      // First limit has been called when we select the group to load data
    const [offsetValue, setOffsetValue] = useState(initialOffset);
    const [pagination, setPagination] = useState(true);
    const [prevriousTotalCount, setPrevriousTotalCount] = useState(PAGE_LIMIT);
    const [lastTopMessageId, setLastTopMessageId] = useState(0);
    const [oldLastTopMessageId, setOldLastTopMessageId] = useState(initialState);
    const imageFileType = ["jpeg", "png", "jpg"];
    const apiCheckhRef = useRef(isAPICallSend);
    const isApiCallCompleted = useRef(apiCompleted);
    const propsActiveUserRef = useRef(props.active_user);
    const propsUserLastTopMsgIdRef = useRef(0);
    const propsUserLastBottomMsgIdRef = useRef(0);
    const propsRecentChatMessagesRef = useRef([]);
    const [shouldRemoveUnreadLabel,setShouldRemoveUnreadLabel] = useState(false);

    useEffect(() => {
        let currentMessagesLength = props.recentChatList[props.active_user].messages.length > 0 ? props.recentChatList[props.active_user].messages.length -1 : props.recentChatList[props.active_user].messages.length;
        setChatMessages(props.recentChatList[props.active_user].messages);
        //ref.current.recalculate();
        // ref.current.getScrollElement().scrollTop = 100;
        propsRecentChatMessagesRef.current = chatMessages;
        if(!props.isfirstTimeThreadOpenApiFinished && !props.recentChatList[props.active_user].isGroup){    // For single
            if((!isThreadOpen && props.recentChatList[props.active_user].msgNew && props.recentChatList[props.active_user].msgNew > 0) || (isThreadOpen && currentMessagesLength <= PAGE_LIMIT && props.recentChatList[props.active_user].msgNew && props.recentChatList[props.active_user].msgNew > 0)){
                setIsThreadOpen(true);
                scrolltoUreadLabel();
            } else if(currentMessagesLength <= PAGE_LIMIT && props.recentChatList[props.active_user].msgNew && props.recentChatList[props.active_user].msgNew == 0) {
                scrolltoBottom();
            }
        }
        if(!props.isfirstTimeThreadOpenApiFinished && props.recentChatList[props.active_user].isGroup){    // For group
            if((!isThreadOpen && props.recentChatList[props.active_user].msgNew && props.recentChatList[props.active_user].msgNew > 0) || (isThreadOpen && currentMessagesLength <= PAGE_LIMIT && props.recentChatList[props.active_user].msgNew && props.recentChatList[props.active_user].msgNew > 0)){
                setIsThreadOpen(true);
                scrolltoUreadLabel();
            } else if(currentMessagesLength <= PAGE_LIMIT && props.recentChatList[props.active_user].msgNew && props.recentChatList[props.active_user].msgNew == 0) {
                scrolltoBottom();
            }
        }
    },[props.recentChatList[props.active_user].messages, props.isfirstTimeThreadOpenApiFinished, isSendSingleMessage]);

    useEffect(() => {
        if(props.recentChatList[props.active_user].messages.length){
            propsActiveUserRef.current = props.active_user;
            propsUserLastTopMsgIdRef.current = props.usersLastTopPageMessageId[props.active_user];
            propsUserLastBottomMsgIdRef.current = props.usersLastUnreadMessageId[props.active_user];
            // setTimeout(function(){ scrolltoUreadLabel(); }, 500);
            let currThread = props.recentChatList[props.active_user];
            setShowStatusBar(false);
            setStatusMessage("");
            setCoveringStatus("");
            if(!currThread.isGroup){
                updateUserPresenceStatus(currThread);
            }

        }


    },[props.active_user, props.recentChatList]);

    const updateUserPresenceStatus = (currThread) => {
        fetch('/ajax/physicians/presence/'+currThread.id)
            .then(data => data.json())
            .then(data => {
                if (data.status == 1) {
                    var mood = '';
                    if(data.mood != null){ mood = '\n\n' + data.mood }
                    setStatusMessage(data.alert + mood );
                    setShowStatusBar(true);
                    setCoveringStatus(data.status);
                }
                else if (data.status == 3) {
                    setStatusMessage(data.alert);
                    setShowStatusBar(true);
                    setCoveringStatus(data.status);
                }
                else if (data.status == 4) {
                    setStatusMessage(data.alert);
                    setShowStatusBar(true);
                    setCoveringStatus(data.status);
                }
                else if (data.status == 2) {
                    setStatusMessage(data.alert);
                    setCoveringContact({"id": data.cid, "name": data.cvr});
                    setShowStatusBar(true);
                    setCoveringStatus(data.status);
                    //Will update here the logic to send coverage messages
                }else {
                    setStatusMessage("");
                    setShowStatusBar(false);
                    setCoveringStatus("");
                }

            });
    }

    const toggle = () => setModal(!modal);
    const addMessage = (message, type) => {
        var messageObj = null;

        let d = new Date();
        var n = d.getSeconds();
        let messageText = message;
        let messageGroupId = props.recentChatList[props.active_user]["id"];
        const messageAttachment = document.querySelector('input[name="fileInput"]').files[0];
        let groupMembers = [];
        if(props.recentChatList[props.active_user].members){
            let groupMembersData = props.recentChatList[props.active_user].members;
            Object.keys(groupMembersData).forEach(function(key) {
                if(groupMembersData[key] && groupMembersData[key].id){
                    groupMembers.push(groupMembersData[key].id);
                }
            });
        }

        //matches the message type is text, file or image, and create object according to it
        switch (type) {
            case "textMessage":
                messageObj = {
                    id : chatMessages.length+1,
                    message : message,
                    lastMessage : Date.now(),
                    userType : "sender",
                    sender : props.my_user,
                    image : avatar4,
                    isFileMessage : false,
                    isImageMessage : false
                }
                props.recentChatList[props.active_user].isGroup === true ? getGroupMembers(messageGroupId, groupMembers, messageText, messageAttachment, type, messageObj) : sendSingleMessage(messageText, messageAttachment, type, messageGroupId, messageObj);
                break;

            case "fileMessage":
                messageObj = {
                    id : chatMessages.length+1,
                    message : message.textMessage,
                    fileMessage : message.name,
                    size : message.size,
                    lastMessage : Date.now(),
                    userType : "sender",
                    sender : props.my_user,
                    image : avatar4,
                    isFileMessage : true,
                    isImageMessage : false
                }
                props.recentChatList[props.active_user].isGroup === true ? getGroupMembers(messageGroupId, groupMembers,  message.textMessage, messageAttachment, type, messageObj) : sendSingleMessage(message.textMessage, messageAttachment, type, messageGroupId, messageObj);
                break;

            case "imageMessage":
                var imageMessage = [
                    { image : message.imageFile },
                ]

                messageObj = {
                    id : chatMessages.length+1,
                    message : message.textMessage,
                    imageMessage : imageMessage,
                    size : message.size,
                    lastMessage : Date.now(),
                    userType : "sender",
                    sender : props.my_user,
                    image : avatar4,
                    isImageMessage : true,
                    isFileMessage : false
                }
                props.recentChatList[props.active_user].isGroup === true ? getGroupMembers(messageGroupId, groupMembers,  message.textMessage, messageAttachment, type, messageObj) : sendSingleMessage(message.textMessage, messageAttachment, type, messageGroupId, messageObj);
                break;

            default:
                break;
        }

        /***
         * Step-1: Fetch the members of the group
         * Step-2: Find message type(Group vs Single) - will do later
         * Step-3: Prepare form data i.e. message, members, attachment (deliver type i.e. Send now or send at 7am, will do this later)etc
         * Step-4: Post API call to send message on server.
         * Step-5: Handle response
         * **** Start: Send Message API ****** */
        // let messageGroupId = props.recentChatList[props.active_user]["id"];
        // const messageAttachment = document.querySelector('input[name="fileInput"]').files[0];
        // getGroupMembers(messageGroupId, messageText, messageAttachment);
        /******** End: Send Message API ****** */

        //add message object to chat
        // setChatMessages([...chatMessages, messageObj]);
        // setTimeout(function(){ scrolltoBottom(); }, 10);
        // Show loader after 2 seconds if didn't get response from API
        //setShowLoader(true);

        loaderRef.current = true;
        const timer =setTimeout(() => {
            if(loaderRef.current){
                setAttachmentLoadingModal(true);
            }
          }, 3000);
        //setAttachmentLoadingModal(!attachmentLoadingModal);
    }

    useEffect(() => {
        // setShowLoader(showLoader);
        loaderRef.current = showLoader;
        setShowLoader(showLoader);
    }, [showLoader]);


    function sendGroupMessage(messageText, messageGroupId, groupMembers, messageAttachment, messageObj, messageType){
        if(groupMembers.length > 0){
            groupMembers.toString();
            let selectedPhy = groupMembers;
            if(messageGroupId < 0){
                let userTempGrp = JSON.parse(localStorage.getItem('temp_groups_user_'+props.my_user));
                if(userTempGrp){
                    const _newTempGrp = userTempGrp.filter((group) => group.id !== messageGroupId);
                    localStorage.setItem('temp_groups_user_'+props.my_user, JSON.stringify(_newTempGrp));
                }
                messageGroupId = null;
            }
            let groupName = props.recentChatList[props.active_user]["name"];
            let messagePath = `/ajax_send_group_message/${messageGroupId}/${selectedPhy}`+"?group_name="+groupName;
            let formData = new FormData();
            formData.append('text', messageText);
            formData.append("content", messageAttachment);
            const requestOptions = {
                method: 'POST',
                body: formData
            };
            
            fetch(messagePath,requestOptions)
                .then(data => data.json())
                .then(data => {
                    setShowLoader(false);
                    loaderRef.current = false;
                    // replace the group id with the Database if the temp group id is -1
                    if(data.error){
                        $("#attachmentModalBody").html(data.errormsg)
                        return false;    
                    }
                    setApiCompleted(true);
                    setAttachmentLoadingModal(false);
                    if(data.image && messageType == "fileMessage"){
                        messageObj['fileMessage'] = [{ image : data.image }]; //data[0].detail.image;
                    }
                    if(data.createdAt){
                        messageObj['time'] = data.createdAt;
                    }
                    if(typeof messageObj === 'object'){
                        messageObj["id"] = data.id;
                    }

                    setChatMessages([...chatMessages, messageObj]);
                    // setTimeout(function(){ scrolltoBottom(); }, 10); // Comment this when send message it's disturb the page smoothnes 

                    let objData = [];
                    objData["groupId"] = data.gid;
                    objData["groupName"] = data.groupName;
                    objData["threadId"] = props.recentChatList[props.active_user].id;
                    objData["messageObj"] = messageObj; // to update last message under recent message thread
                    let objChat = {id: data.gid};
                    props.updateTempGroup(objData);
                    // props.pollChatData().then(()=> {
                    //     fetchAndSetGroupMessagesThread(objChat);
                    // });
                    fetchAndSetGroupMessagesThread(objChat);
                })
                .catch(error => console.log(error));
        }
    }

    function fetchAndSetGroupMessagesThread(chat){
        let id = chat.id;
        if(id > 0){   // -1 for temp group that not stored in the database yet
            fetch('/ajax_group_messages/'+id+'?new_msg=true&pagination=true&pagelimit=1')
                .then(data => data.json())
                .then(data => {
                    let conversations = [];
                    let dataMessages = data.messages;
                    let members = data.members;
                    let priv = data.priv;
                    let owner = data.owner;
                    Object.keys(dataMessages).forEach(function(key) {

                        let messageData = {
                            id: dataMessages[key]['id'],
                            message: dataMessages[key]['text'],
                            time: dataMessages[key]['createdAt'],
                            sender : dataMessages[key]['senderPhysician'],
                            senderName : dataMessages[key]['fullname'],
                            isImageMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) != -1) ? true: false,
                            imageMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) != -1) ? [ { image : "/getMsgImg/"+dataMessages[key]["id"]+"/"+dataMessages[key]["image"] } ] : "",
                            isFileMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) == -1) ? true: false,
                            fileMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) == -1) ? [ { image : "/getMsgImg/"+dataMessages[key]["id"]+"/"+dataMessages[key]["image"] } ] : ""
                        };
                        conversations.push(messageData);
                    });
                    if(props.recentChatList[props.active_user].messages && props.recentChatList[props.active_user].messages.length > 1){
                        props.loadGroup(conversations, members, priv, id, owner, false);        //  send last parameter false to don't update the current thread to adjust the smoothnes as it's already added in to via setChatMessages, 
                    } else {
                        props.loadGroup(conversations, members, priv, id, owner);
                    }
                    scrolltoBottom();
                });
        }
    }

    function getGroupMembers(messageGroupId, groupMembers, message, messageAttachment, messageType, messageObj){
        if(messageGroupId < 0){
            if(groupMembers.length > 1){
                groupMembers.splice(0, 1);
            }
            sendGroupMessage(message, messageGroupId, groupMembers, messageAttachment, messageType);
        } else {
            let getMembersApiPath = `/ajax_group_members/${messageGroupId}`;
            let groupMembersArr = [];
            fetch(getMembersApiPath, {
                method: "GET"
            })
                .then(data => data.json())
                .then(data => {
                    Object.keys(data).forEach(function(key) {
                        if(data[key].id){
                            groupMembersArr.push(data[key].id);
                        }
                    });
                    sendGroupMessage(message, messageGroupId, groupMembersArr, messageAttachment, messageObj, messageType);
                })
                .catch(error => console.log(error));
        }
    }

    function sendSingleMessage(messageText, messageAttachment, messageType, tempContactId, messageObj){
        setIsSendSingleMessage(true);
        let toId = props.recentChatList[props.active_user].id;
        let messagePath = `/ajax_send/${toId}/undefined`;
        let formData = new FormData();
        formData.append('msgTxt', messageText);
        formData.append('toId', toId);
        formData.append('reId', 'undefined');
        formData.append('receipt_confirmation_type', $('#receipt_confirmation_type').val());
        formData.append('receipt_confirmation_time', $('#receipt_confirmation_time').val());

        formData.append("content", messageAttachment);
        const requestOptions = {
            method: 'POST',
            body: formData
        };
        fetch(messagePath,requestOptions)
            .then(data => data.json())
            .then(data => {
                if(data.error){
                    $("#attachmentModalBody").html(data.error)
                    return false;    
                }
                loaderRef.current = false;
                setAttachmentLoadingModal(false);
                if(data[0].detail && data[0].detail.image && messageType == "fileMessage"){
                    messageObj['fileMessage'] = [{ image : data[0].detail.image }]; //data[0].detail.image;
                }
                if(data[0].detail && data[0].detail.createdAt){
                    messageObj['time'] = data[0].detail.createdAt;
                }
                setChatMessages([...chatMessages, messageObj]);
                setTimeout(function(){
                     scrolltoBottom(); 
                }, 10);
                let objData = [];
                objData["index"] = tempContactId;
                objData["messageObj"] = messageObj; // to update last message under recent message thread
                props.updateTempSingleChat(objData);
                $("#fileupload").val('').clone(true);
                $('#OpenImgUpload').removeClass("attached");
            }).then(data => {
                props.pollChatData();   // Commented for now which causing thread smoothness
            })
            .catch(error => console.log(error));
    }

    function scrolltoBottom(){
        if (ref.current.el) {
            if(showArrowIcon == false){
                ref.current.getScrollElement().scrollTop = ref.current.getScrollElement().scrollHeight;
            }            
            var overlayEle = document.getElementById("overlay_thread");
            if(typeof(overlayEle) != 'undefined' && overlayEle != null){
                setTimeout(function(){ overlayEle.style.display = "none"; }, 10);
            }
        }
    }

    function scrolltoUreadLabel(){
        if (ref.current.el) {
            if($(".unreadLabel").length){
                ref.current.getScrollElement().scrollTop =  ($(".unreadLabel").offset().top - ($("#messages").offset().top  - 10)) ;
                var overlayEle = document.getElementById("overlay_thread");
                if(typeof(overlayEle) != 'undefined' && overlayEle != null){
                    setTimeout(function(){ overlayEle.style.display = "none"; }, 10);
                }
            }else {
                if(!props.usersLastUnreadMessageId[props.active_user]){
                    // scrolltoBottom();
                }
            }
        }
    }

    const deleteMessage = (id) => {
        let conversation = chatMessages;

        var filtered = conversation.filter(function (item) {
            return item.id !== id;
        });

        setChatMessages(filtered);
    }

    const groupReadStatusPopup = (id) => {
        fetch('/ajax_pm_detail/'+id)
            .then(data => data.text())
            .then(data => {
                props.setActiveGroupReadStatus(data);
            });
        toggle();
    }

    const startChatWithProvider = (contactObj) => {
        setShowStatusBar(false);
        // Check if that contact is already exists in the recent chat or not?
        let isExistsInRecent = false;
        let activeUserKey = 0;
        props.recentChatList.map((recentChat, keyChat) => {
            if( recentChat.id == contactObj.id ){
                activeUserKey = keyChat;
                return isExistsInRecent = true;
            }
        })
        if(isExistsInRecent){
            props.setActiveTab('chat');
            props.activeUser(activeUserKey);
            props.fetchMessagesThread(contactObj.id);
        } else {
            var obj = {
                id: contactObj.id,
                name: contactObj.name,
                profilePicture: "Null",
                isGroup: false,
                unRead: 0,
                isNew: true,
                saved: false,
                lastMessage: null,
                msgNew: 0,
                unread: 0,
                messages: [],
                isTempSingle: true
            }
            props.createTempSingleChat(obj);
        }
    }

    useEffect(() => {
        propsUserLastTopMsgIdRef.current = props.usersLastTopPageMessageId[props.active_user];
        //scrolltoUreadLabel();
      }, [chatMessages, offsetValue]);
        
    const handleLoadMoreData = (messageType, refData = []) => {
        setShowArrowIcon(false);
        let activeUserIdex = props.active_user;
        let userTopMessageId = props.usersLastTopPageMessageId[activeUserIdex] ? props.usersLastTopPageMessageId[activeUserIdex] : 0;
        let unreadMessageId = props.usersLastUnreadMessageId[activeUserIdex] ? props.usersLastUnreadMessageId[activeUserIdex] : 0;
        let userCurrentThread = props.recentChatList[activeUserIdex].messages;
        if(refData.length > 0 && messageType == "old"){
            activeUserIdex = refData[0];
            userTopMessageId = refData[1];
            userCurrentThread = refData[2];
        } else if(refData.length > 0 && messageType == "new"){
            activeUserIdex = refData[0];
            unreadMessageId = props.usersLastUnreadMessageId[activeUserIdex]; //refData[1];
            userCurrentThread = refData[2];
        }
        // props.recentChatList[props.active_user].isGroup
        let id = props.recentChatList[activeUserIdex].id; //chat.id;
        let isPagination = pagination;
        let topMessageId    = userTopMessageId;
        if(messageType == "old"){
            setOldLastTopMessageId(topMessageId)
            if($(".message-class-"+topMessageId).length){
                ref.current.getScrollElement().scrollTop = ($(".message-class-"+topMessageId).offset().top - ($("#messages").offset().top  - 30));
            }
        }

        if(props.recentChatList[activeUserIdex].isGroup){
            if(id > 0){
                let displayWarningMsg = messageType == "old" ? "You have reached the end of the secure text thread. No more text messages available." : "No more new messages are available";
                if((messageType == "old" && !isMoreTopPagination)){    
                    setIsMoreBottomPagination(false);                        
                    setShowArrowIcon(false);
                    toast.warning(displayWarningMsg, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        transition: Slide
                    });
                }

                let makeQueryString = "";
                if(unreadMessageId == 0 && messageType == "new") return
                if(!isMoreTopPagination && messageType == "old") return
                if(messageType == "old"){
                    setLoadMoreData(true);
                    setMoreTopPagination(false);
                    let updatedNewOffsetVal = Number(offsetValue) + Number(PAGE_LIMIT);
                    setOffsetValue(updatedNewOffsetVal);
                    makeQueryString = "?pagelimit="+PAGE_LIMIT+"&topMessageId="+topMessageId;
                } else {
                    setLoadMoreNewData(true);
                    makeQueryString = "?pagination="+isPagination+"&firstUnreadMessageId="+unreadMessageId;
                }
                setApiCompleted(false);
                fetch('/ajax_group_messages/'+id+makeQueryString+'&pagination=true')
                .then(data => data.json())
                .then(data => {
                    // setShowArrowIcon
                    let conversations = [];
                    let dataMessages = data.messages;
                    let members = data.members;
                    let priv = data.priv;
                    let owner = data.owner;

                    if(messageType == "old"){
                        setLoadMoreData(false);
                    } else {
                        setLoadMoreNewData(false);
                    }
                    if((messageType == "new" && props.usersLastUnreadMessageId == 0)){
                        setIsMoreBottomPagination(false);                        
                        setShowArrowIcon(false);
                        toast.warning(displayWarningMsg, {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: false,
                            draggable: true,
                            progress: undefined,
                            transition: Slide
                        });
                    } else {
                        let lastUnreadMessageId = 0;
                        let topMessageId = 0;
                        Object.keys(dataMessages).forEach(function(key) {
                            const checkAlreadyIdExists = obj => obj.id == dataMessages[key]['id'];
                            // Put if condition !chatMessages.some(checkAlreadyIdExists) here: if you want to filter out the duplicate message
                                if(key == 0){
                                    topMessageId = dataMessages[key]['id'];
                                }
                                let messageData = {
                                    id: dataMessages[key]['id'],
                                    message: dataMessages[key]['text'],
                                    time: dataMessages[key]['createdAt'],
                                    sender : dataMessages[key]['senderPhysician'],
                                    senderName : dataMessages[key]['fullname'],
                                    isImageMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) != -1) ? true: false,
                                    imageMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) != -1) ? [ { image : "/getMsgImg/"+dataMessages[key]["id"]+"/"+dataMessages[key]["image"] } ] : "",
                                    isFileMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) == -1) ? true: false,
                                    fileMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) == -1) ? [ { image : "/getMsgImg/"+dataMessages[key]["id"]+"/"+dataMessages[key]["image"] } ] : ""
                                };
                                conversations.push(messageData);
                                lastUnreadMessageId = dataMessages[key]['id'];
                        });
                        setIsAPICallSend(true);
                        const checkUnreadLabel = obj => obj.customClass === 'unreadLabel';
                        if(userCurrentThread.some(checkUnreadLabel)){
                            setShouldRemoveUnreadLabel(true);
                        } else {
                            setShouldRemoveUnreadLabel(false);
                        }
                        if(messageType == "old"){
                            if(dataMessages.length == 0){
                                toast.warning(displayWarningMsg, {
                                    position: "top-right",
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: false,
                                    draggable: true,
                                    progress: undefined,
                                    transition: Slide
                                });
                                setMoreTopPagination(false);
                            } else {
                                setPrevriousTotalCount(dataMessages.length);
                                let newPageLimit = Number(PAGE_LIMIT) + Number(pagelimit);
                                setPagelimit(newPageLimit);
                                props.setUsersLastTopMessageId(activeUserIdex, topMessageId);
                                setMoreTopPagination(true);
                                userCurrentThread.unshift(...conversations);
                                ref.current.getScrollElement().scrollTop = 400;//ref.current.getScrollElement().scrollHeight + 20;
                                setLastTopMessageId(conversations[0].id);
                            }
                        } else {
                            props.setUsersLastUnreadMessageId(activeUserIdex, lastUnreadMessageId);
                            if(conversations.length == 0){
                                toast.warning(displayWarningMsg, {
                                    position: "top-right",
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: false,
                                    draggable: true,
                                    progress: undefined,
                                    transition: Slide
                                });
                            } else {
                                // props.setUsersLastUnreadMessageId(activeUserIdex, lastUnreadMessageId);
                                userCurrentThread.push(...conversations);
                                setIsMoreBottomPagination(true);
                            }
                        }
                    }
                    setApiCompleted(true);
                });
            }
        } else {    //  For single message
            let displayWarningMsg = messageType == "old" ? "You have reached the end of the secure text thread. No more text messages available." : "No more new messages are available";
            if((messageType == "old" && !isMoreTopPagination)){
                setIsMoreBottomPagination(false);
                setShowArrowIcon(false);
                toast.warning(displayWarningMsg, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    transition: Slide
                });
            }
            if(unreadMessageId == 0 && messageType == "new") return
            if(!isMoreTopPagination && messageType == "old") return
            if(messageType == "old"){
                setLoadMoreData(true);
                setMoreTopPagination(false);
            } else {
                setLoadMoreNewData(true);
            }
            setApiCompleted(false);
            let formData = new FormData();
            formData.append('group', 'STAFF');
            formData.append('id', id);
            formData.append('pagelimit', PAGE_LIMIT);
            formData.append('pagination', isPagination);
            if(messageType == "old"){
                setLoadMoreData(true);
                setMoreTopPagination(false);
                formData.append('topMessageId', topMessageId);
            } else {
                setLoadMoreNewData(true);
                formData.append('firstUnreadMessageId', unreadMessageId);
            }
            const requestOptions = {
                method: 'POST',
                body: formData
            };
            let markedReadPoint = false;
            fetch('/msg/ajax_filter_msg_group?new_msg=true', requestOptions)
            .then(data => data.json())
            .then(data => {
                let conversations = [];
                if(messageType == "old"){
                    setLoadMoreData(false);
                } else {
                    setLoadMoreNewData(false);
                }

                if((messageType == "new" && props.usersLastUnreadMessageId == 0)){
                    setIsMoreBottomPagination(false);                        
                    setShowArrowIcon(false);
                    toast.warning(displayWarningMsg, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        transition: Slide
                    });

                } else {
                    let lastUnreadMessageId = 0;
                    let topMessageId = 0;
                    let dataLoopCounter = 0;
                    Object.keys(data).forEach(function(key) {
                        if(!markedReadPoint && data[key]['outbound']==false && data[key]['detail']["confirmedAt"] == null ){
                            markedReadPoint = true;
                            conversations.push({ id : 33, customLabel:true, label: /*chat.msgNew+*/" New message(s)", customClass : "unreadLabel" });
                        }
                        if(data[key]['detail']["createdAt"]){

                        }
                        if(dataLoopCounter == 0){
                            topMessageId = data[key]['detail']['id'];
                        }
                        let messageData = {
                            id: data[key]['detail']['id'],
                            message: data[key]['detail']['text'],
                            time: data[key]['detail']['createdAt'],
                            userType: (data[key]['outbound']) ?"sender":"receiver",
                            sender : data[key]['from']['id'],
                            senderName : data[key]['from']['name'],
                            receiver : data[key]['to']['id'],
                            receiverName : data[key]['to']['name'],
                            isImageMessage : (data[key]['detail']["image"] && imageFileType.indexOf(data[key]['detail']["file_ext"]) != -1) ? true: false,
                            imageMessage : (data[key]['detail']["image"] && imageFileType.indexOf(data[key]['detail']["file_ext"]) != -1) ? [ { image : data[key]['detail']["image"] } ] : "",
                            isFileMessage : (data[key]['detail']["image"] && imageFileType.indexOf(data[key]['detail']["file_ext"]) == -1) ? true: false,
                            fileMessage : (data[key]['detail']["image"] && imageFileType.indexOf(data[key]['detail']["file_ext"]) == -1) ? [ { image : data[key]['detail']["image"] } ] : ""
                        };
                        conversations.push(messageData);
                        lastUnreadMessageId = data[key]['id'];
                        dataLoopCounter++;
                    });
                    setIsAPICallSend(true);
                    const checkUnreadLabel = obj => obj.customClass === 'unreadLabel';
                    if(userCurrentThread.some(checkUnreadLabel)){
                        setShouldRemoveUnreadLabel(true);
                    } else {
                        setShouldRemoveUnreadLabel(false);
                    }
                    if(messageType == "old"){
                        if(data.length == 0){
                            toast.warning(displayWarningMsg, {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: false,
                                draggable: true,
                                progress: undefined,
                                transition: Slide
                            });
                            setMoreTopPagination(false);
                        } else {
                            setPrevriousTotalCount(data.length);
                            let newPageLimit = Number(PAGE_LIMIT) + Number(pagelimit);
                            setPagelimit(newPageLimit);
                            props.setUsersLastTopMessageId(activeUserIdex, topMessageId);
                            setMoreTopPagination(true);
                            userCurrentThread.unshift(...conversations);
                            ref.current.getScrollElement().scrollTop = 400;//ref.current.getScrollElement().scrollHeight + 20;
                            setLastTopMessageId(conversations[0].id);
                        }
                    } else {
                        props.setUsersLastUnreadMessageId(activeUserIdex, lastUnreadMessageId);
                        if(data.length == 0){
                            toast.warning(displayWarningMsg, {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: false,
                                draggable: true,
                                progress: undefined,
                                transition: Slide
                            });
                            setIsMoreBottomPagination(false);
                        } else {
                            // props.setUsersLastUnreadMessageId(activeUserIdex, lastUnreadMessageId);
                            userCurrentThread.push(...conversations);
                            setIsMoreBottomPagination(true);
                        }
                    }
                }
                setApiCompleted(true);
            });
        }
    }

    useEffect(() => {
        ref.current.recalculate();
    })

    const observer = useRef();
    const watch = document.querySelector('.topPaginationLink');
    const watchBottom = document.querySelector('.bottomPaginationLink');

    useEffect(() => {        
        apiCheckhRef.current = isAPICallSend;
        isApiCallCompleted.current = apiCompleted;
        if(shouldRemoveUnreadLabel){            
            const checkUnreadLabel = obj => obj.customClass === 'unreadLabel';
            if(checkUnreadLabel){
                setShouldRemoveUnreadLabel(false);
                let chatMessages2 = props.recentChatList[props.active_user].messages.filter((obj) => {
                    return obj.customClass !== 'unreadLabel';
                })
                props.recentChatList[props.active_user].messages = chatMessages2;
            }            
        }
        setChatMessages(props.recentChatList[props.active_user].messages);
        propsRecentChatMessagesRef.current = chatMessages;
        if(oldLastTopMessageId != 0 && $(".message-class-"+oldLastTopMessageId).length){
            ref.current.getScrollElement().scrollTop = ($(".message-class-"+oldLastTopMessageId).offset().top - ($("#messages").offset().top  - 30));
        }
        propsUserLastTopMsgIdRef.current = props.usersLastTopPageMessageId[props.active_user];
    }, [isAPICallSend, apiCompleted, props.recentChatList[props.active_user].messages]);

    const obCallback = (payload) => {
        let activeUeserIndex = propsActiveUserRef.current;
        let userTopMessageId = propsUserLastTopMsgIdRef.current;
        // Add in condition if you stop the top pagination once all new messages read using botton pagination:  || props.usersLastUnreadMessageId[props.active_user] && props.usersLastUnreadMessageId[props.active_user] != 0
        if(!apiCheckhRef.current || propsRecentChatMessagesRef.current.length < PAGE_LIMIT || !isApiCallCompleted.current || !props.isfirstTimeThreadOpenApiFinished || !userTopMessageId) return;
        if (payload[0].isIntersecting && isMoreTopPagination && apiCheckhRef.current) {
            let refData = [activeUeserIndex, userTopMessageId, propsRecentChatMessagesRef.current]
            handleLoadMoreData("old", refData);
            setIsAPICallSend(false);
        }
    }
      
    if(watch && isMoreTopPagination){
        const observer = new IntersectionObserver(obCallback);
        observer.observe(watch);
        observer.unobserve(watch)
        setTimeout(() => {
            observer.observe(watch);
        }, 2000)
    }
    // For Bottom Pagination observer
    const obCallbackBottom = (payload) => {
        let activeUeserIndex = propsActiveUserRef.current;
        let userBottomMessageId = propsUserLastBottomMsgIdRef.current;
        let newMessageCounter = props.recentChatList[activeUeserIndex].msgNew;
        // Add in condition if you stop the top pagination once all new messages read using botton pagination:  || props.usersLastUnreadMessageId[props.active_user] && props.usersLastUnreadMessageId[props.active_user] != 0
        if(!apiCheckhRef.current || chatMessages.length < PAGE_LIMIT || !isApiCallCompleted.current || !props.isfirstTimeThreadOpenApiFinished || !userBottomMessageId) return;
        if (payload[0].isIntersecting && isMoreTopPagination && apiCheckhRef.current) {
            let refData = [activeUeserIndex, userBottomMessageId, propsRecentChatMessagesRef.current]
            handleLoadMoreData("new", refData);
            setIsAPICallSend(false);
        }
    }

    if(watchBottom && isMoreBottomPagination){
        const observerBottom = new IntersectionObserver(obCallbackBottom);
        observerBottom.observe(watchBottom);
        observerBottom.unobserve(watchBottom)
        setTimeout(() => {
            observerBottom.observe(watchBottom);
        }, 2000)
    }
      
    return (
        <React.Fragment>
            <div className="user-chat w-100 user-chat-show">
                <div className="d-lg-flex">
                    <div className={ props.userSidebar ? "w-70" : "w-100" }>
                        {/* render user head */}
                        <UserHead />
                            <SimpleBar
                                style={{ maxHeight: "100%" }}
                                ref={ref}
                                className="chat-conversation p-3 p-lg-4"
                                autoHide={false}
                                id="messages">
                                <div style={{"display": "none"}} id="overlay_thread"><LoadingSpinner /></div>

                                {/* Render Presence/coverage status */}
                            {
                                showStatusBar ?
                                    <div className="container-fluid presence_status_alert">
                                        <div className="col-lg-12" >
                                            <div className="alert alert-warning">
                                                <a href="#" className="close" data-dismiss="alert">×</a>
                                                {
                                                    (coveringContact.id !== props.my_user) ?
                                                        <div>
                                                            {
                                                                (coveringStatus == 2) ?
                                                                    <span>
                                                                        This provider is currently covered by {coveringContact.name}.
                                                                        <span style={{paddingLeft: '5px', cursor: "pointer"}} onClick={() => startChatWithProvider(coveringContact)} >
                                                                        Click here to secure text with {coveringContact.name}. <i className="fa fa-external-link" aria-hidden="true"></i>
                                                                        </span>
                                                                    </span>
                                                                : <span dangerouslySetInnerHTML={{__html: statusMessage}}></span>
                                                            }
                                                        </div>
                                                    :
                                                    "This provider is currently covered by yourself."
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    null
                            }

                                <div className="container-fluid">
                                    <div className="offset-lg-3 col-lg-4" >
                                        <div className=" topPaginationLink"  onClick={()=>{handleLoadMoreData('old')}} style={{cursor: "pointer"}}>
                                            {/* Click here to load more data */}
                                            {
                                                loadMoreData ? <LoadingSpinner overrideClassName="small-spinner" /> : null
                                            }
                                        </div>
                                    </div>
                                </div>

                                <ul className="list-unstyled mb-0">
                                {
                                        chatMessages.map((chat, key) =>
                                            chat.customLabel && chat.customLabel === true ?
                                                <li key={"dayTitle" + key} ref={ref2}>
                                                    <div className="chat-day-title">
                                                        <span className={"title " +chat.customClass} >{chat.label}</span>
                                                    </div>
                                                    {
                                                        props.isfirstTimeThreadOpenApiFinished ? 
                                                        '<span id="scrollToUnreadText" onClick={executeScroll} style={{ position: "fixed", top: "80%", width: "8%", textAlign: "right", zIndex: "1", left: "90%", backgroundColor: "rgb(42, 145, 241)", color: "white", padding: "5px", cursor: "pointer" }}><i class="fa fa-angle-double-down" aria-hidden="true"></i> New Messages</span>' 
                                                        : ""
                                                    }
                                                    
                                                </li>
                                            :
                                                (props.recentChatList[props.active_user].isGroup === true) ?
                                                    <li
                                                    className={`message-class-${chat.id} ${chat.userType === "sender" || chat.sender == props.my_user ? "right" : "left"}`}
                                                    >
                                                        <div className="conversation-list">

                                                            <div className="chat-avatar">
                                                            {chat.userType === "sender" ?
                                                                <span className="profile_image_wrap">
                                                                   <img src={"physicians/getPhysicianImg/"+chat.sender} alt="" />
                                                                   <div className="presence-alignment-chat-thread"><ContactPresence args={[ {presence: props.my_presence, id: props.my_user, isCovered: props.isCovered || props.covId ? true : false} ]} /></div>
                                                                </span>
                                                            :
                                                                props.recentChatList[props.active_user].profilePicture === "Null" ?
                                                                        <div className="chat-user-img align-self-center me-3">
                                                                                    <div className="avatar-xs">
                                                                                        <span className="avatar-title rounded-circle bg-soft-primary text-primary">
                                                                                            {chat.userName && chat.userName.charAt(0)}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                :
                                                                <span className="profile_image_wrap">
                                                                    <img src={"physicians/getPhysicianImg/"+chat.sender} alt="" />
                                                                    {
                                                                        (props.recentChatList[props.active_user].members) &&
                                                                            props.recentChatList[props.active_user].members.map((member, key) =>
                                                                                (member && chat.sender==member.id) &&
                                                                                <div className="presence-alignment-chat-thread"><ContactPresence args={[ {presence: member.presence, id: member.id, isCovered: member.isCovered || member.covId ? true : false} ]} /></div>
                                                                            )
                                                                    }

                                                                </span>
                                                            }
                                                            </div>

                                                            <div className="user-chat-content">
                                                                <div className="ctext-wrap">
                                                                    <div className="ctext-wrap-content">
                                                                        {
                                                                            chat.message &&
                                                                                <p className="mb-0" dangerouslySetInnerHTML={{ __html: chat.message }}></p>
                                                                        }
                                                                        {
                                                                            chat.isImageMessage &&
                                                                                // image list component
                                                                                <ImageList images={chat.imageMessage} />
                                                                        }
                                                                        {
                                                                            chat.isFileMessage &&
                                                                                //file input component
                                                                                <FileList fileName={chat.fileMessage} fileSize={chat.size} />
                                                                        }
                                                                        {
                                                                            chat.isTyping &&
                                                                                <p className="mb-0">
                                                                                    typing
                                                                                    <span className="animate-typing">
                                                                                        <span className="dot ms-1"></span>
                                                                                        <span className="dot ms-1"></span>
                                                                                        <span className="dot ms-1"></span>
                                                                                    </span>
                                                                                </p>
                                                                        }
                                                                        {
                                                                            !chat.isTyping && <p className="chat-time mb-0"><i className="ri-time-line align-middle"></i> <span className="align-middle">{ moment.utc(chat.time).local().format(USE_TIME_FORMAT) }</span></p>
                                                                        }
                                                                    </div>
                                                                    {
                                                                        (chat.userType === "sender" || chat.sender == props.my_user) ? 
                                                                            !chat.isTyping &&
                                                                                <UncontrolledDropdown className="align-self-start">
                                                                                    <DropdownToggle tag="a">
                                                                                        <i className="ri-more-2-fill"></i>
                                                                                    </DropdownToggle>
                                                                                    <DropdownMenu>
                                                                                        <DropdownItem onClick={() => groupReadStatusPopup(chat.id)}>{t('Read status')} <i className="ri-file-copy-line float-end text-muted"></i></DropdownItem>
                                                                                    </DropdownMenu>
                                                                                </UncontrolledDropdown>
                                                                        : ""
                                                                    }

                                                                </div>
                                                                {
                                                                    <div className="conversation-name">{chat.userType === "sender" ? chat.senderName : chat.senderName}</div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </li>
                                                :
                                                    <li
                                                    key={key} 
                                                    // className={chat.userType === "sender" ? "right" : "left"}
                                                    className={`message-class-${chat.id} ${chat.userType === "sender" ? "right" : "left"}`}
                                                    >
                                                        <div className="conversation-list">
                                                            {
                                                                //logic for display user name and profile only once, if current and last messaged sent by same receiver
                                                                chatMessages[key+1] ?
                                                                    chatMessages[key].userType === chatMessages[key+1].userType ?
                                                                        <div className="chat-avatar">
                                                                            <div className="blank-div"></div>
                                                                        </div>
                                                                    :
                                                                        <div className="chat-avatar">
                                                                                {chat.userType === "sender" ?
                                                                                    <span className="profile_image_wrap">
                                                                                        <img src={"physicians/getPhysicianImg/"+chat.sender} alt="" />
                                                                                        <div className="presence-alignment-chat-thread"><ContactPresence args={[ {presence: props.my_presence, id: props.my_user, isCovered: props.isCovered || props.covId ? true : false} ]} /></div>
                                                                                    </span>
                                                                                :
                                                                                    props.recentChatList[props.active_user].profilePicture === "Null" ?
                                                                                        <div className="chat-user-img align-self-center me-3">
                                                                                            <div className="avatar-xs">
                                                                                                <span className="avatar-title rounded-circle bg-soft-primary text-primary">
                                                                                                    {props.recentChatList[props.active_user].name.charAt(0)}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    :
                                                                                    <span className="profile_image_wrap">
                                                                                        <img src={"physicians/getPhysicianImg/"+chat.sender} alt="" />
                                                                                        <div className="presence-alignment-chat-thread"><ContactPresence args={[ {presence: props.recentChatList[props.active_user].presence, id: props.recentChatList[props.active_user].id, isCovered: props.recentChatList[props.active_user].isCovered || props.recentChatList[props.active_user].covId ? true : false} ]} /></div>
                                                                                    </span>
                                                                                }
                                                                            </div>
                                                                :   <div className="chat-avatar">
                                                                        {chat.userType === "sender" ?
                                                                            <span className="profile_image_wrap">
                                                                                <img src={"physicians/getPhysicianImg/"+chat.sender} alt="" />
                                                                                <div className="presence-alignment-chat-thread"><ContactPresence args={[ {presence: props.my_presence, id: props.my_user, isCovered: props.isCovered || props.covId ? true : false} ]} /></div>
                                                                            </span>

                                                                            :
                                                                            props.recentChatList[props.active_user].profilePicture === "Null" ?
                                                                                    <div className="chat-user-img align-self-center me-3">
                                                                                                <div className="avatar-xs">
                                                                                                    <span className="avatar-title rounded-circle bg-soft-primary text-primary">
                                                                                                        {props.recentChatList[props.active_user].name.charAt(0)}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                :
                                                                                <span className="profile_image_wrap">
                                                                                    <img src={"physicians/getPhysicianImg/"+chat.sender} alt="" />
                                                                                    <div className="presence-alignment-chat-thread"><ContactPresence args={[ {presence: props.recentChatList[props.active_user].presence, id: props.recentChatList[props.active_user].id, isCovered: props.recentChatList[props.active_user].isCovered || props.recentChatList[props.active_user].covId ? true : false} ]} /></div>
                                                                                </span>
                                                                        }
                                                            </div>
                                                            }

                                                            <div className="user-chat-content">
                                                                <div className="ctext-wrap">
                                                                    <div className="ctext-wrap-content">
                                                                        {
                                                                            chat.message &&
                                                                            <p className="mb-0" dangerouslySetInnerHTML={{ __html: chat.message }}></p>
                                                                        }
                                                                        {
                                                                            chat.imageMessage &&
                                                                                // image list component
                                                                                <ImageList images={chat.imageMessage} />
                                                                        }
                                                                        {
                                                                            chat.fileMessage &&
                                                                                //file input component
                                                                                <FileList fileName={chat.fileMessage} fileSize={chat.size} />
                                                                        }
                                                                        {
                                                                            chat.isTyping &&
                                                                                <p className="mb-0">
                                                                                    typing
                                                                                    <span className="animate-typing">
                                                                                        <span className="dot ms-1"></span>
                                                                                        <span className="dot ms-1"></span>
                                                                                        <span className="dot ms-1"></span>
                                                                                    </span>
                                                                                </p>
                                                                        }
                                                                        {
                                                                            !chat.isTyping && <p className="chat-time mb-0"><i className="ri-time-line align-middle"></i> <span className="align-middle">{moment.utc(chat.time).local().format(USE_TIME_FORMAT)}</span></p>
                                                                        }
                                                                    </div>
                                                                </div>
                                                                {
                                                                    chatMessages[key+1] ? chatMessages[key].userType === chatMessages[key+1].userType ? null :  <div className="conversation-name">{chat.userType === "sender" ? chat.senderName : chat.senderName }</div> : <div className="conversation-name">{chat.userType === "sender" ? chat.senderName : chat.senderName}</div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                }
                                {
                                    (props.recentChatList[props.active_user].isGroup === true && !props.recentChatList[props.active_user].priv && props.recentChatList[props.active_user].id >0) &&
                                        <li key="historical_1">
                                            <div className="chat-day-title">
                                                <span className={"title not-a-member"} >You have access to historical messages only as you have been removed from the group.</span>
                                            </div>
                                        </li>
                                }
                            </ul>
                                {
                                    (props.usersLastUnreadMessageId[props.active_user]) ?
                                        <div className="container-fluid">
                                            <div className="bottomPaginationLink offset-lg-3 col-lg-4" onClick={()=>{handleLoadMoreData('new')}}>
                                                {
                                                    loadMoreNewData ? <LoadingSpinner overrideClassName="small-spinner" /> : null
                                                }
                                            </div>
                                        </div>
                                    : ""
                                }
                                    
                                </SimpleBar>

                        <Modal backdrop="static" isOpen={modal} centered toggle={toggle}>
                            <ModalHeader toggle={toggle}>Message Read Status</ModalHeader>
                            <ModalBody>
                                <CardBody className="p-2">
                                    <SimpleBar style={{maxHeight: "200px"}}>
                                        <div dangerouslySetInnerHTML={{__html: props.activeGroupReadStatus }}></div>
                                    </SimpleBar>
                                </CardBody>
                            </ModalBody>
                        </Modal>
                        {
                            ((props.recentChatList[props.active_user].isGroup === false && props.recentChatList[props.active_user].covId == null) ||
                                ((props.recentChatList[props.active_user].isGroup === true &&
                                    typeof props.recentChatList[props.active_user].priv === 'object' &&
                                    props.recentChatList[props.active_user].priv !== null &&
                                    !Array.isArray(props.recentChatList[props.active_user].priv)) ||
                                    (props.recentChatList[props.active_user].isGroup === true &&
                                    props.recentChatList[props.active_user].id <0)
                                )
                            ) &&
                                <ChatInput onaddMessage={addMessage} isGroup={props.recentChatList[props.active_user].isGroup} />
                        }
                    </div>

                    <UserProfileSidebar activeUser={props.recentChatList[props.active_user]} />

                    {/* attachment loading and error message Modal */}
                    {/* <Modal isOpen={attachmentLoadingModal} centered toggle={toggleAttachmentLoadingModal} backdrop="static">
                        <ModalHeader tag="h5" className="font-size-16" toggle={toggleAttachmentLoadingModal}>
                           Sending Message
                        </ModalHeader>
                        <ModalBody className="p-4" id="attachmentModalBody" style={{height: "200px"}}>
                            <LoadingSpinner />
                        </ModalBody>
                    </Modal> */}
                    {
                        attachmentLoadingModal ? <AjaxLoadingSpinner /> : ""
                    }
                    <ToastContainer
                        position="top-right"
                        autoClose={2000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </div>
            </div>
        </React.Fragment>
    );
}

const mapStateToProps = (state) => {
    const { my_user, my_presence, activeGroupReadStatus, page_per_limit, usersLastUnreadMessageId, usersLastTopPageMessageId } = state.secureText.Chat;
    const { userSidebar, isfirstTimeThreadOpenApiFinished } = state.secureText.Layout;
    return { userSidebar,my_user, my_presence, activeGroupReadStatus, page_per_limit, usersLastUnreadMessageId, isfirstTimeThreadOpenApiFinished, usersLastTopPageMessageId  };
};
export default withRouter(connect(mapStateToProps, { openUserSidebar, updateTempGroup, setMessagesThread, setActiveGroupReadStatus, updateTempSingleChat, createTempSingleChat, pollChatData, loadGroup, setActiveTab, activeUser, fetchMessagesThread, setUsersLastUnreadMessageId, setUsersLastTopMessageId })(UserChat));
