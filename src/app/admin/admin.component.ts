import { Component, OnInit, TemplateRef  } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../app.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  userList: any;
  deleteSucess: any = false;
  createSucess: any = false;
  modalRef: BsModalRef;
  selectedTab: any;
  formdata: any;
  constructor(private router: Router,
    private appService: AppService,
    private modalService: BsModalService) {}
  ngOnInit() {
    this.formdata = new FormGroup({
      setusername: new FormControl(),
      setpassword: new FormControl(),
      setconfirmpassword: new FormControl(),
      dropdownTab: new FormControl(),
   });
    this.formdata.get('dropdownTab').setValue('tab3');
    this.appService.getUsers().subscribe((success : any)=>{
      this.userList = success.data;
    }, (err)=>{
      alert('Unable to fetch data from the backend db')
    }
    );
  }
  logout() {
    localStorage.removeItem("loggedUser");
    this.router.navigate(['/', 'login']);
  }
  delete(x){
    this.appService.deleteUser(x).subscribe((success : any)=>{
      this.deleteSucess = true;
      this.ngOnInit();
      setTimeout(function() {
        this.deleteSucess = false;
      }.bind(this), 2000);
    }, (err)=>{
      alert('Unable to fetch data from the backend db')
    }
    );
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  create() {
    if ((this.formdata.value.setpassword !== this.formdata.value.setconfirmpassword)) {
      alert('Passwords not matching');
    } else {
      if (this.formdata.value.setusername !== '' && this.formdata.value.setusername !== undefined
      && this.formdata.value.setusername !== null ) {
        debugger
        this.selectedTab = this.formdata.value.dropdownTab;
        let mn: number,hr: number,ad: number,ep: number;
        if(this.selectedTab=='tab1'){
          mn=0;
          hr=0;
          ad=1;
          ep=0;
        }else if(this.selectedTab=='tab2'){
          mn=0;
          hr=1;
          ad=0;
          ep=0;
        }else if(this.selectedTab=='tab3'){
          mn=1;
          hr=0;
          ad=0;
          ep=0;
        }else if(this.selectedTab=='tab4'){
          mn=0;
          hr=0;
          ad=0;
          ep=1;
        }
        // api to store the data
        this.appService.signup(this.formdata.value.setusername,this.formdata.value.setpassword,hr,ad,mn,ep).subscribe((success: any)=>{
          if(success.message=='Signup is successful'){
            this.modalRef.hide();
            this.emptyForm();
            this.createSucess = true;
            setTimeout(function() {
              this.createSucess = false;
            }.bind(this), 2000);
            this.ngOnInit();
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
  emptyForm() {
    this.formdata.get('setpassword').setValue('');
    this.formdata.get('setusername').setValue('');
    this.formdata.get('setconfirmpassword').setValue('');
  }
}
