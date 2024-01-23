import React from 'react';
import { Card, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { Link } from "react-router-dom";

//i18n
import { useTranslation } from 'react-i18next';

function FileList(props) {

    /* intilize t variable for multi language implementation */
    const { t } = useTranslation();

    return (
        <React.Fragment>
            <Card className="p-2 mb-2">
                <div className="d-flex align-items-center">
                    <div className="avatar-sm me-3 ms-0">
                        <div className="avatar-title bg-soft-primary text-primary rounded font-size-20">
                            <i className="fas fa-file-pdf"></i>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="text-start">
                            <h5 className="font-size-14 mb-1">File attached. </h5>
                            <p className="text-muted font-size-13 mb-0"></p>
                        </div>
                    </div>

                    {<div className="ms-4">
                        <ul className="list-inline mb-0 font-size-20">
                            <li className="list-inline-item">
                                {/* use download in tag if download file directly */}
                                <a href={props.fileName && props.fileName[0] && props.fileName[0]["image"] ? props.fileName[0]["image"] : "#"} target="_blank">
                                    <i className="ri-download-2-line"></i>
                                </a>
                            </li>
                        </ul>
                    </div>}
                </div>
            </Card>
        </React.Fragment>
    );
}

export default FileList;