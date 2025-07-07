// import React from "react";
// import { Link } from "react-router-dom";
// import useGlobalReducer from "../hooks/useGlobalReducer"; // Custom hook for accessing the global state.
// import { useForm } from "react-hook-form";
import isotipo from "../assets/img/isotipo.png"
export const Contact = () => {
    // const { store, dispatch } = useGlobalReducer();
    // const {
    //     register,
    //     handleSubmit,
    //     watch,
    //     formState: { errors },
    // } = useForm();

    // const onSubmit = (data) => console.log(data);

    // console.log(watch("example")); 
    return (
        <>
            <div className="d-flex align-items-center justify-content-center vh-100"
                style={{ backgroundColor: "#464469" }}>

                <form className="px-5 py-5 mx-0" style={{ backgroundColor: "#0d0d0d", color: "#7975B1" }}>
                    <div className="text-center">
                        <img src={isotipo} alt="GitWise logo" width="70" />
                        <h4 className="mt-3">Contact Us</h4>
                    </div>

                    <div className="form-group fs-4">
                        <label for="exampleFormControlInput1">Full name</label>
                        <input
                            type="Name"
                            className="form-control"
                            id="exampleFormControlInput1"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="form-group fs-4">
                        <label for="exampleFormControlInput1">Your email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="exampleFormControlInput1"
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className="form-group fs-4">
                        <label for="exampleFormControlInput1">Subject</label>
                        <input
                            type="Subject"
                            className="form-control"
                            id="exampleFormControlInput1"
                            placeholder="Questions about Premium / Technical issue / Constructive feedback"
                        />
                    </div>
                    <div className="form-group fs-4">
                        <label for="exampleFormControlTextarea1">Your message:</label>
                        <textarea
                            className="form-control"
                            id="exampleFormControlTextarea1"
                            rows="6"
                        ></textarea>
                    </div>
                    <br />
                    <button type="button" className="btn btn-gitwise">
                        Send
                    </button>
                </form>
            </div >
        </>
    )
}