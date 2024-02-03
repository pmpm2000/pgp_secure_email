function Validation(values) {

    let error = {}

    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/



    if(values.emailrcv === "") { 
        error.emailrcv = "Pole obowiązkowe"    
        }else if(!email_pattern.test(values.emailrcv)) {
            error.emailrcv = "Niepoprawny format adresu email"
        }else {
            error.emailrcv = ""
        }
    if(values.body === "") {
        error.body = "Pole obowiązkowe"
    }else {
        error.body = ""
    }
    return error;}
export default Validation;