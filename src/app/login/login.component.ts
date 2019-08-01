import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  selectedTab: any;
  selectedTab1: any;
  formdata: any;
  loginTab: boolean;
  loggedUser: any;
  @ViewChild('tabset') tabset: TabsetComponent;
  constructor(private router: Router,
    private appService: AppService) {
  }
  ngOnInit() {
    this.formdata = new FormGroup({
      username : new FormControl(),
      password: new FormControl(),
      setusername: new FormControl(),
      setpassword: new FormControl(),
      setconfirmpassword: new FormControl(),
      dropdownTab: new FormControl(),
      dropdownTabSignup: new FormControl(),
   });
    this.loginTab = true;
    this.formdata.get('dropdownTab').setValue('tab3');
    this.formdata.get('dropdownTabSignup').setValue('tab2');
  }
  login() {
    this.selectedTab = this.formdata.value.dropdownTab;
    if (this.selectedTab === 'tab1') {
      this.appService.loginVerify(this.formdata.value.username,this.formdata.value.password,0,1,0,0).subscribe((success : any)=>{
        if(success.data[0].success!==0){
          this.loggedUser = success.loggeduser;
          localStorage.setItem("loggedUser", this.loggedUser);
          this.router.navigate(['/', 'admin', 'list']);
        }else{
          alert('Invalid Credentials. Please try again')
        }
      }, (err)=>{
        alert('Unable to fetch data from the backend db')
      }
      );
    } else if (this.selectedTab === 'tab2') {
      this.appService.loginVerify(this.formdata.value.username,this.formdata.value.password,1,0,0,0).subscribe((success: any)=>{
        if(success.data[0].success!==0){
          this.loggedUser = success.loggeduser;
          localStorage.setItem("loggedUser", this.loggedUser);
          this.router.navigate(['/', 'hr', 'list']);
        }else{
          alert('Invalid Credentials. Please try again')
        }
      }, (err)=>{
        alert('Unable to fetch data from the backend db')
      }
      );
    }  else if (this.selectedTab === 'tab3') {
      this.appService.loginVerify(this.formdata.value.username,this.formdata.value.password,0,0,1,0).subscribe((success: any)=>{
        if(success.data[0].success!==0){
          this.loggedUser = success.loggeduser;
          localStorage.setItem("loggedUser", this.loggedUser);
          this.router.navigate(['/', 'manager', 'list']);
        }else{
          alert('Invalid Credentials. Please try again')
        }
      }, (err)=>{
        alert('Unable to fetch data from the backend db')
      }
      );
    } else if (this.selectedTab === 'tab4') {
      this.appService.loginVerify(this.formdata.value.username,this.formdata.value.password,0,0,0,1).subscribe((success: any)=>{
        if(success.data[0].success!==0){
          this.loggedUser = success.loggeduser;
          localStorage.setItem("loggedUser", this.loggedUser);
          this.router.navigate(['/', 'employee', 'list']);
        }else{
          alert('Invalid Credentials. Please try again')
        }
      }, (err)=>{
        alert('Unable to fetch data from the backend db')
      }
      );
    }
  }
  signup() {
    if ((this.formdata.value.setpassword !== this.formdata.value.setconfirmpassword)) {
      alert('Passwords not matching');
    } else {
      if (this.formdata.value.setusername !== '' && this.formdata.value.setusername !== undefined
      && this.formdata.value.setusername !== null ) {
        this.selectedTab1 = this.formdata.value.dropdownTabSignup;
        let mn: number,hr: number,ep: number
        if(this.selectedTab1=='tab1'){
          mn=0;
          hr=1;
          ep=0;
        }else if(this.selectedTab1=='tab2'){
          mn=1;
          hr=0;
          ep=0;
        } else if(this.selectedTab1=='tab3'){
          mn=0;
          hr=0;
          ep=1;
        }
        // api to store the data
        this.appService.signup(this.formdata.value.setusername,this.formdata.value.setpassword,hr,0,mn,ep).subscribe((success: any)=>{
          if(success.message=='Signup is successful'){
            this.loginTab = true;
            this.emptyForm();
            this.tabset.tabs[1].active = false;
            this.tabset.tabs[0].active = true;
          }else{
            alert('Unable to add the requested User. Please try again')
          }
        }, (err)=>{
          alert('Unable to fetch data from the backend db')
        }
        );
      } else {
        alert('Enter your username');
      }
    }
  }
  onSelect(e) {
    if (e.id === 'tab1') {
      this.loginTab = true;
    } else {
      this.loginTab = false;
    }
    this.emptyForm();
  }
  emptyForm() {
    this.formdata.get('username').setValue('');
    this.formdata.get('password').setValue('');
    this.formdata.get('setpassword').setValue('');
    this.formdata.get('setusername').setValue('');
    this.formdata.get('setconfirmpassword').setValue('');
  }
}
