function getYear() {

    return new Date().getFullYear();
}

const Footer = () => {

    return (

        <footer>
            {/* wrapper */}
            <div className="wrapper">
                {/* copyright */}
                <p>Copyright © {getYear()}</p>
                {/* credit */}
                <p className="socialLinks">By
                    <a href="https://katiemak.dev/" target="_blank" rel="noopener noreferrer"> Katie</a>,
                    <a href="https://hadiyahussein.com/" target="_blank" rel="noopener noreferrer"> Hadiya</a>,
                    <a href="http://solivanlau.com/" target="_blank" rel="noopener noreferrer"> Solivan</a>,
                    <a href="https://amiracle.dev/" target="_blank" rel="noopener noreferrer"> Amir </a>
                    at
                    <a href="https://junocollege.com/" target="_blank" rel="noopener noreferrer"> Juno College</a>
                </p>

            </div>
        </footer>
    )
}

export default Footer;