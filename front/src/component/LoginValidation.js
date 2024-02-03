function Validation(values) {

    let error = {}

    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/



    if(values.email === "") { 
        error.email = "Pole obowiązkowe"    
        }else if(!email_pattern.test(values.email)) {
            error.email = "Niepoprawny format adresu email"
        }else {
            error.email = ""
        }
    if(values.password === "") {
        error.password = "Pole obowiązkowe"
    }else {
        error.password = ""
    }
    return error;}
export default Validation;
