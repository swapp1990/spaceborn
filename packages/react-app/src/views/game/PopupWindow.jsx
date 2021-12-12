import { Modal } from "antd"
import { useState } from "react";
import "./popupWindow.scss"
export default function PopupWindow({ onCloseCallback, popupMsg }) {
    const [isModalVisible, setIsModalVisible] = useState(true);
    const [modalImageSrc, setModalImageSrc] = useState();

    const showModal = () => {
        setIsModalVisible(true);
    };
    const handleOk = () => {
        setIsModalVisible(false);
        onCloseCallback({ msg: "ok" })
    };
    const handleCancel = () => {
        setIsModalVisible(false);
        onCloseCallback({ msg: "cancel" })
    };

    return (<div className="wrapper">
        <Modal title={popupMsg.title} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <img style={{ width: 300 }} src={popupMsg.imgSrc} />
        </Modal>
    </div>)
}