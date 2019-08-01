import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { FileSelectDirective, FileUploader} from 'ng2-file-upload';
import { FileService } from './../file.service';
import { FormGroup, FormControl } from '@angular/forms';
import { AppService } from '../app.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { saveAs } from 'file-saver';
const path = 'http://localhost:3000/upload';
@Component({
  selector: 'app-root',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
  providers:[FileService]
})
export class EmployeeComponent implements OnInit {
  loggedUser: any;
  formdata: any;
  attachmentList:any = [];
  loader: boolean = false;
  myOptions: any = [];
  dropdownSettings = {};
  showHistory: boolean = false;
  userList: any = [];
  historyArray:any = [];
  selectedItems: any;
  dropdownList: any = [];
  uploader:FileUploader = new FileUploader({
    url:path
  });
    constructor(private router: Router,
        private appService: AppService,
        private modalService: BsModalService,
        private _fileService:FileService) {
          this.uploader.onCompleteItem = (item:any, response:any , status:any, headers:any) => {
            this.appService.getResumeStrength(['Java']).subscribe((success: any)=>{
            }, (err)=>{
            })
            this.attachmentList.push(JSON.parse(response));
        }
        }
  ngOnInit() {
    this.getUsers();
    this.showHistory = false;
    this.formdata = new FormGroup({
      message : new FormControl()
    })
    this.loggedUser = localStorage.getItem("loggedUser");
  }
  getUsers(){
    this.appService.getUsers().subscribe((success : any)=>{
      this.userList = success.data;
      for(let i=0;i<this.userList.length;i++){
        if(this.userList[i].manager==1){
          this.myOptions.push(this.userList[i]);
        }
      }
      this.dropdownList = this.myOptions;
      this.selectedItems = [
      ];
      this.dropdownSettings = {
        singleSelection: true,
        idField: 'username',
        textField: 'username',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 5,
        allowSearchFilter: true
      };
    }, (err)=>{
      alert('Unable to fetch data from the backend db')
    }
    );
  }
  logout() {
    localStorage.removeItem("loggedUser");
    this.router.navigate(['/', 'login']);
  }
  sendEmail(){
    this.loader = true;
    let today = new Date();
    let arr123 = [];
    this.showHistory = false;
    arr123.push(this.selectedItems)
    this.appService.postEmail(arr123,this.formdata.value.message,this.loggedUser,today).subscribe((success : any)=>{
      this.loader = false;
      alert("Email has been sent")
    },(error)=>{
    });
  }
  chatOpen(emailGetId: any){
    this.formdata.get('message').setValue('');
    this.historyArray = [];
    this.appService.getEmail(localStorage.getItem("loggedUser"),emailGetId[0]).subscribe((success : any)=>{
        this.showHistory = !this.showHistory;
        this.historyArray = success.data;
    },(error)=>{
      alert(error)
      this.showHistory = false;
    })
  }
  chatHide(){
    this.showHistory=!this.showHistory;
  }
  onItemSelect(item: any) {
  }
  onSelectAll(items: any) {
  }
}
