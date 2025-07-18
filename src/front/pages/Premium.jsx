import React from "react";

{/*Nota: se tiene que mejorar el metodo de pago y hacer que cuando pagues se active la funcionalidad */}
const Premium = () => {
    return (
        <div className="container text-light py-5">
            <h2>Donate Here</h2>
            <form className="bg-dark p-4 rounded">
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" placeholder="Full Name" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Card number</label>
                    <input type="text" className="form-control" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="mb-3">
                    <label className="form-label">
                        Expiration date</label>
                    <input type="text" className="form-control" placeholder="MM/AA" />
                </div>
                <div className="mb-3">
                    <label className="form-label">CVV</label>
                    <input type="text" className="form-control" placeholder="123" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Payment method</label>
                    <select className="form-select">
                        <option>Debit card</option>
                        <option>Credit card</option>
                        <option>PayPal</option>
                        <option>Google Pay</option>
                    </select>
                </div>
                <button type="button" className="btn btn-primary w-100">Pay</button>
            </form>
        </div>
    );
};

export default Premium;
