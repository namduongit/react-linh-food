
import zalo from '../../assets/contact/zalo-icon.png';

const ZaloButton = () => {
    return (
        <a
            href="https://zalo.me/0364979922"
            target="_blank"
            rel="noopener noreferrer"
            className="zalo-button"
        >
            <img src={zalo} alt="Zalo" />
        </a>
    );
};

export default ZaloButton;
