import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 *  This class used to call apis at root level
 *
 * @export
 * @class AppService
 */
@Injectable()
export class AppService {
   
    constructor(
        private http: HttpClient
    ) { }
    
    loginVerify(user: any,pass: any,hrlogin: number,adminlogin: number,managerlogin: number,employeelogin: number){
        return this.http.post('http://localhost:3000/login',{
            username: user,
            password: pass,
            hr: hrlogin,
            admin: adminlogin,
            manager: managerlogin,
            employee: employeelogin
        })
    }
    signup(user: any,pass: any,hrlogin: number,adminlogin: number,managerlogin: number,employeelogin: number){
        return this.http.post('http://localhost:3000/signup',{
            username: user,
            password: pass,
            hr: hrlogin,
            admin: adminlogin,
            manager: managerlogin,
            employee: employeelogin
        })
    }
    getUsers(){
        return this.http.get('http://localhost:3000/loginvalidate');
    }
    getClassification(){
        return this.http.get('http://localhost:3000/getClassification');
    }
    getFiles(){
        return this.http.get('http://localhost:3000/getFiles');
    }
    deleteUser(user:any){
        return this.http.post('http://localhost:3000/user',{
            'username': user
        });
    }
    deleteFile(file:any){
        return this.http.post('http://localhost:3000/file',{
            'filename': file
        });
    }
    updatePermissions(type: any,users: any){
        return this.http.post('http://localhost:3000/updatePermission',{
            'type': type,
            'users': users
        });
    }
    getResumeStrength(skills: any){
        return this.http.post('http://localhost:3000/strength',{
            'requestedSkills': skills
        });
    }  
    postEmail(email: any,body: any,sender: any,date: any){
        return this.http.post('http://localhost:3000/email',{
            'email': email,
            'body': body,
            'sender' : sender,
            'date': date
        });
    }
    getEmail(sender: any,receiver: any){
        return this.http.post('http://localhost:3000/getemail',{
            'receiver': receiver,
            'sender' : sender,
        });
    }
}