import "./dashboard.css";
export default function Dashboard() {
    return (
        <div className="body">
            <div className="main">
                <div className="profile">
                    <div className="profileObj">
                        <div className="profileImg">
                            <img src="./img_avatar.png" alt="Avatar"></img>
                        </div>
                        <div className="profileInfo">
                            <div>username</div>
                            <div>description</div>
                        </div>
                    </div>
                </div>
                <div className="rounds">
                    <div className="title">
                        Choose Round
                    </div>
                    <div className="roundsObj">
                        <div className="roundBox">
                            Round 1
                        </div>
                        <div className="roundBox">
                            Round 2
                        </div>
                        <div className="roundBox">
                            Round 3
                        </div>
                    </div>
                </div>
                <div className="activity">
                    <div className="act-title">
                        Recent Activity
                    </div>
                    <div className="act-list">
                        <li>
                            <ul>
                                user1 defeated alien Chad and dropped Vehicle Gear
                            </ul>
                            <ul>
                                user2 lost to alien Chad and lost Pills Gear
                            </ul>
                        </li>
                    </div>
                </div>
            </div>
        </div>
    )
}