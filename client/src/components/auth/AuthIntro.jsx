import logo from "../../assets/logo/PeerubLogo.svg";
import { Link } from "react-router-dom";

const AuthIntro = ({ heading, subText, linkText, linkTo }) => (
  <div className="text-center">
    <img src={logo} alt="Peerup" className="mx-auto mb-1 h-11" />
    <h2 className="text-xl font-bold">{heading}</h2>
    <p className="text-sm mt-1 text-gray-400">
      {subText}{" "}
      <Link to={linkTo} className="text-blue-600 underline font-semibold">
        {linkText}
      </Link>
    </p>
  </div>
);

export default AuthIntro;
