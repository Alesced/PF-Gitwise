import React from "react";

const Free = () => {
    return (
        <div className="container text-light py-5">
            <h2>Free Plan activated</h2>
            {/*Nota: hacer un mensaje emergente "felicidades ya activaste el plan"*/}
            <ul>
                <li>Unlimited repositories (basic public or private)</li>
                <li>Community and collaborative support</li>
                <li>Up to 2,000 minutes of CI/CD per month</li>
                <li>Basic AI search (limited)</li>
            </ul>
        </div>
    );
};

export default Free;