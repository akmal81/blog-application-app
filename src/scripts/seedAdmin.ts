import { email } from "better-auth/*";
import { prisma } from "../lib/prisma"
import { UserRole } from "../middlewares/auth"

async function seedAdmin() {
    try {
        const adminData = {
            name: "Admin5 Saheb",
            email:"admin5@admin.com",
            role: UserRole.ADMIN,
            password: "admin1234",
            emailVerified:true
        }


        // check user exist on db or not
        const existingUser = await prisma.user.findUnique(
            {
                where:{
                    email:adminData.email
                }
            }
        );


        if(existingUser){
            throw new Error("User already exists!!");
        };


        const signUpAdmin = await fetch('http://localhost:5000/api/auth/sign-up/email',{
            method:"POST",
            headers:{
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(adminData)
        })

        if(signUpAdmin.ok){
            await prisma.user.update(
                {
                    where:{
                        email:adminData.email
                    },
                    data:{
                        emailVerified: true
                    }
                }
            )
        }
        
    } catch (error) {
        console.log(error)
    }
}

seedAdmin()