import "./dashboard.scss";

export default function Dashboard({ address, tx, contracts, provider }) {
    const dashboard_body = (
        <div className="dash-main">
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
        </div>
    );

    return (
        <>
            {dashboard_body}
        </>
    )
}