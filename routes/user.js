const { User } = require('../models/user');

const { Shop } = require('../models/shop.js');
const { ImageUpload } = require('../models/imageUpload');
const { sendVerificationEmail } = require('../helper/sendVerificationEmail.js')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const multer = require('multer');
const fs = require("fs");
const { sendForgetPasswordEmail } = require('../helper/sendForgetPasswordEmail.js');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true
});
var imagesArr = [];
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
        //imagesArr.push(`${Date.now()}_${file.originalname}`)

    },
})
const upload = multer({ storage: storage })
router.post(`/upload`, upload.array("images"), async (req, res) => {
    imagesArr = [];

    try {

        for (let i = 0; i < req?.files?.length; i++) {

            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: false,
            };

            const img = await cloudinary.uploader.upload(req.files[i].path, options,
                function (error, result) {
                    imagesArr.push(result?.secure_url);
                    fs.unlinkSync(`uploads/${req.files[i].filename}`);
                });
        }


        let imagesUploaded = new ImageUpload({
            images: imagesArr,
        });

        imagesUploaded = await imagesUploaded.save();
        return res.status(200).json(imagesArr);



    } catch (error) {
        console.log(error);
    }
});
router.post(`/signup`, async (req, res) => {
    const { name, phone, email, password, isAdmin } = req.body;

    try {
        const existingVerifiedUser = await User.findOne({ email: email, isVerified: true });
        const existingUserByPh = await User.findOne({ phone: phone });

        if (existingVerifiedUser) {
            return res.status(400).json({ error: true, msg: "User already exists!" });
        }

        const existingUserByEmail = await User.findOne({ email });
        const verifyCodeEmail = Math.floor(100000 + Math.random() * 900000).toString();

        let result;
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return res.status(400).json({ error: true, msg: "User already exists!" });
            } else {
                const hashPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashPassword;
                existingUserByEmail.verifyCode = verifyCodeEmail;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                result = await existingUserByEmail.save();
            }
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            result = await User.create({
                name: name,
                phone: phone,
                email: email,
                verifyCode: verifyCodeEmail,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                password: hashPassword,
                isAdmin: isAdmin
            });
        }
        let shop;
        // Create a shop for the user
        if (result.isAdmin === true) {
            shop = await Shop.create({
                name: `${name}'s Shop`,
                email: email,
                owner: result._id
            });
        }

        const token = jwt.sign({ email: result.email, id: result._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY);
        const emailResponse = await sendVerificationEmail(email, name, verifyCodeEmail);

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email.",
            token: token,
            user: result,
            shop: shop
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, msg: "Something went wrong." });
    }
});
router.post(`/signin`, async (req, res) => {
    const { email, password } = req.body;

    try {

        const existingUser = await User.findOne({ email: email, isVerified: true });
        if (!existingUser) {
            res.status(404).json({ error: true, msg: "User not found" })
            return
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if (!matchPassword) {
            return res.status(400).json({ error: true, msg: "Invailid Password" })
        }

        const shop = await Shop.findOne({ owner: existingUser._id });

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        return res.status(200).send({
            user: existingUser,
            token: token,
            shop: shop,
            msg: "user Authenticated"
        })

    } catch (error) {
        return res.status(500).json({ error: true, msg: "something went wrong" });
    }

})
router.put(`/changePassword/:id`, async (req, res) => {

    try {
        const { name, phone, email, password, newPass, images } = req.body;

        // console.log(req.body)

        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ error: true, msg: "User not found!" })
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if (!matchPassword) {
            return res.json({ error: true, msg: "current password wrong" })
        } else {

            let newPassword

            if (newPass) {
                newPassword = bcrypt.hashSync(newPass, 10)
            } else {
                newPassword = existingUser.passwordHash;
            }


            const user = await User.findByIdAndUpdate(
                req.params.id,
                {
                    name: name,
                    phone: phone,
                    email: email,
                    password: newPassword,
                    images: images,
                },
                { new: true }
            )

            if (!user)
                return res.status(400).send('the user cannot be Updated!')

            return res.send(user);
        }

    } catch (error) {
        console.log('user_changePassword', error)
        return res.status(500).json({ message: 'Internal server error' })
    }


})
router.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: true, msg: 'User not found!' });
        }

        const verifyCodeEmail = Math.floor(100000 + Math.random() * 900000).toString();

        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        user.verifyCode = verifyCodeEmail;
        user.verifyCodeExpiry = Date.now() + 3600000; // 1 hour
        await user.save();
        const emailResponse = await sendForgetPasswordEmail(email,user.name, verifyCodeEmail);
        return res.status(200).send({
            user: user,
            token: token,
            msg: "user Authenticated"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, msg: 'Something went wrong.' });
    }
});
router.post('/verifyEmail', async (req, res) => {
    // const { email, verificationCode } = req.body;

    // try {
    //     const user = await User.findOne({ email });

    //     if (!user) {
    //         return res.status(404).json({ error: true, msg: 'User not found!' });
    //     }

    //     if (user.verifyCode !== verificationCode || user.verifyCodeExpiry < Date.now()) {
    //         return res.status(400).json({ error: true, msg: 'Invalid or expired verification code.' });
    //     }

    //     user.isVerified = true;
    //     user.verifyCode = undefined;
    //     user.verifyCodeExpiry = undefined;
    //     await user.save();

    //     return res.status(200).json({
    //         success: true,
    //         message: 'Email verified successfully.'
    //     });

    // } catch (error) {
    //     console.log(error);
    //     return res.status(500).json({ error: true, msg: 'Something went wrong.' });
    // }
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email })
        if(!user){
            return res.status(404).json({ success: false, message: "User not found"})
        }
        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save();
            return res.status(201).json({ success: true, message: "User verified successfully" }) 
        }else if(!isCodeNotExpired){
            return res.status(401).json({ success: false, message: "Verify code is expired, please signup again"})
        }else if(!isCodeValid){
            return res.status(401).json({ success: false, message: "Verify code is invalid, please signup again"})
        }
    } catch (error) {
        console.log(`Error while verify user ${error}`)
        return res.status(500).json({ message: "Internal server error "})
    }
});
router.post('/resetPassword', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: true, msg: 'User not found!' });
        }

        if (!user.verifyCode || user.verifyCodeExpiry < Date.now()) {
            return res.status(400).json({ error: true, msg: 'Invalid or expired reset token.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password has been reset successfully.'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, msg: 'Something went wrong.' });
    }
});

router.get(`/`, async (req, res) => {
    try {
        const userList = await User.find().populate('followedShops');

        if (!userList) {
            return res.status(500).json({ success: false })
        }
        return res.send(userList);
    } catch (error) {
        console.log('Error user_get', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followedShops');

        if (!user) {
            return res.status(404).json({ message: 'The user with the given ID was not found.' })
        }
        return res.status(200).send(user);
    } catch (error) {
        console.log('user_getbyid', error)
        return res.status(500).json({ message: 'Internal server error.' })
    }
})
router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'the user is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "user not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})
router.get(`/get/count`, async (req, res) => {
    try {
        const userCount = await User.countDocuments()

        if (!userCount) {
            return res.status(500).json({ success: false })
        }
        return res.send({
            userCount: userCount
        });
    } catch (error) {
        console.log("Error while /get/count", error)
        return res.status(500).json({ message: 'Internal server error' })
    }
})
router.put('/:id', async (req, res) => {

    const { name, phone, email } = req.body;
    try {

        const userExist = await User.findById(req.params.id);

        if (req.body.password) {
            newPassword = bcrypt.hashSync(req.body.password, 10)
        } else {
            newPassword = userExist.passwordHash;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: name,
                phone: phone,
                email: email,
                password: newPassword,
                images: imagesArr,
            },
            { new: true }
        )

        if (!user)
            return res.status(400).send('the user cannot be Updated!')

        return res.send(user);

    } catch (error) {
        console.log('user_put', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
})
router.delete('/deleteImage', async (req, res) => {
    try {
        const imgUrl = req.query.img;
    
        const urlArr = imgUrl.split('/');
        const image = urlArr[urlArr.length - 1];
    
        const imageName = image.split('.')[0];
    
        const response = await cloudinary.uploader.destroy(imageName, (error, result) => {
            // console.log(error, res)
        })
    
        if (response) {
           return res.status(200).send(response);
        }
    } catch (error) {
        console.log('user_deleteImage', error)
        return res.status(500).json({ message: "Internal server error"})
    }

});
router.post('/follow/:shopId', async (req, res) => {
    const userId = req.body.userId;
    const { shopId } = req.params;

    try {
        const user = await User.findByIdAndUpdate(userId, {
            $addToSet: { followedShops: shopId }
        }, { new: true }); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Increment followers count for the shop
        await Shop.findByIdAndUpdate(shopId, {
            $inc: { followersCount: 1 }
        });

        res.status(200).json({ message: 'Shop followed successfully', user });
    } catch (error) {
        console.error('Error following shop:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/unfollow/:shopId', async (req, res) => {
    const userId = req.body.userId; // Extract userId from request body
    const { shopId } = req.params;

    try {
        const user = await User.findByIdAndUpdate(userId, {
            $pull: { followedShops: shopId }
        }, { new: true }); // Return the updated document

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Decrement followers count for the shop
        await Shop.findByIdAndUpdate(shopId, {
            $inc: { followersCount: -1 }
        });

        res.status(200).json({ message: 'Shop unfollowed successfully', user });
    } catch (error) {
        console.error('Error unfollowing shop:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/followed-shops', async (req, res) => {
    try {
      const user = await User.find(req.query).populate('followedShops');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.json(user.followedShops);
    } catch (error) {
      console.error('Error fetching followed shops:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

module.exports = router;