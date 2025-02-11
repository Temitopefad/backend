const verifyAdmin = (req, res,next) => {
if (req.role !== 'admin') {
    return res.status(403).send({success: false, message: 'You are not an admin'});
} 
next();  


}
module.exports = verifyAdmin