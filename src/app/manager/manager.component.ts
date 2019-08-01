import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { FileUploader} from 'ng2-file-upload';
import { FileService } from './../file.service';
import { AppService } from '../app.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
const path = 'http://localhost:3000/upload';
@Component({
  selector: 'app-root',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss'],
  providers:[FileService]
})
export class ManagerComponent implements OnInit {
  customClass = 'customClass';
  isFirstOpen = false;
  StrongclassifyArray = [];
  users: Object;
  loading = false;
  loading1 = false;
  loading3 = false;
  tableShow = false;
  uploader:FileUploader = new FileUploader({
    url:path
  });
  fileList: any;
  formdata: any;
  fileListStrength: any;
  fileListSave: any;
  filesStrengthNotPresent: boolean = false;
  loggedManager: any;
  myOptions:any = [];
  dropdownList = [];
  modalRef: BsModalRef;
  userList: any;
  historyArray:any = [];
  emailCounter: any;
  allowDownload: any;
  allowDelete: any;
  filesNotPresent: boolean = true;
  check: boolean = false;
  dropdownSettings = {};
  attachmentList:any = [];
  selected: any;
  states: string[] = [
    'Java',
    'Python',
    'Angular'
  ]

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
    this.formdata = new FormGroup({
      message : new FormControl()
    })
    this.dropdownList = this.states;
    this.selected = [
    ];
    this.dropdownSettings = {
      singleSelection: true,
      idField: '',
      textField: '',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.loggedManager = localStorage.getItem("loggedUser");
    this.appService.getUsers().subscribe((success : any)=>{
      this.userList = success.data;
      for(let i=0;i<this.userList.length;i++){
        if(this.userList[i].manager==1){
          this.myOptions.push(this.userList[i]);
        }
      }
      for(let j=0;j<this.myOptions.length;j++){
        if(this.loggedManager==this.myOptions[j].username){
          this.allowDownload = this.myOptions[j].allowdownload;
          this.allowDelete = this.myOptions[j].allowdelete;
        }
      }
    }, (err)=>{
      alert('Unable to fetch data from the backend db')
    }
    );
    this.appService.getFiles().subscribe((success : any)=>{
      this.fileList = success.data;
      if(this.fileList.length==0){
        this.filesNotPresent = true;
      } else {
        this.filesNotPresent = false;
      }
    }, (error)=>{
      alert('Uploaded file already exists')
    }
    );
  }
  openModal(template: TemplateRef<any>,x: any) {
    this.chatOpen(x)
    this.modalRef = this.modalService.show(template);
  }
  logout() {
    localStorage.removeItem("loggedUser");
    this.router.navigate(['/', 'login']);
  }
  download(x){
    let link = document.createElement("a");
    link.download = x;
    link.href = "assets/files/"+x;
    link.click();
  }
  delete(x){
    this.appService.deleteFile(x).subscribe((success : any)=>{
      alert('File Deleted Successfully');
    }, (error)=>{
    }
    );
  }
  onItemSelect(item: any) {
  }
  onSelectAll(items: any) {
  }
  search(x){
    // api to send the responses to backend and subsequently to a python function in 
    this.tableShow = false;
    this.fileListStrength = [];
    this.loading = true;
    this.appService.getResumeStrength(x).subscribe((success : any)=>{
      this.users = success;
      this.loading = false;
      this.tableShow = true;
      this.appService.getFiles().subscribe((success : any)=>{
        this.fileListStrength = success.data;
        for(let i=0;i<this.fileListStrength.length;i++){
          this.fileListStrength[i]['shortlisted'] = false
        }
        this.fileListSave = this.fileListStrength;
        if(this.fileListStrength.length==0){
          this.filesStrengthNotPresent = true;
        } else {
          this.filesStrengthNotPresent = false;
        }
      }, (error)=>{
        alert('Uploaded file already exists')
      }
      );
    }, (error)=>{
      alert('Unable to get the updated List');
    }
    );
  }
  sendEmail(){
    let today = new Date();
    let arr123 = [];
    arr123.push(this.emailCounter)
    this.loading3 = true;
    this.appService.postEmail(arr123,this.formdata.value.message,localStorage.getItem("loggedUser"),today).subscribe((success : any)=>{
      this.loading3 = false;
      this.modalRef.hide();
      alert("Email has been sent")
    },(error)=>{
    });
  }
  classification(){
    this.StrongclassifyArray = [];
    this.loading1 = true;
    this.appService.getClassification().subscribe((success : any)=>{
      this.loading1 = false;
      success = success.data.split('\n');
      let k=0;
      while((k+1)<(success.length-1)){
        this.StrongclassifyArray.push({
          name: success[k].split(/.*[\/|\\]/)[1],
          strong: success[k+1]
      })
      k=k+2;
      }
    },(error)=>{
       alert("Unable to classify the Resumes")
    }
    );
  }
  shortlist(){
    let count = 0;
    let shortlistedArray = [];
    let today = new Date();
    for(let i=0;i<this.fileListStrength.length;i++){
      if(this.fileListStrength[i].shortlisted==true){
        count = count+1;
        shortlistedArray.push(this.fileListStrength[i].email)
      }
    }
    if(count==0){
      alert("No Candidates have been shorlisted yet!!")
    }else{
      this.loading = true;
      this.appService.postEmail(shortlistedArray,"Congratulations!! You have been shortlisted",localStorage.getItem("loggedUser"),today).subscribe((success : any)=>{
        this.loading = false;
        alert("Email has been sent")
     },(error)=>{
       this.loading = false;
     });
    }
  }
  chatOpen(emailGetId: any){
    this.formdata.get('message').setValue('');
    this.historyArray = [];
    this.emailCounter = emailGetId;
    this.appService.getEmail(localStorage.getItem("loggedUser"),emailGetId).subscribe((success : any)=>{
        this.historyArray = success.data;
    },(error)=>{
      alert(error)
    })
  }
  sort(x){
    this.check=!this.check;
    if(x=='experience'){
      if(!this.check){
        var sortedArray: [] = this.fileListStrength.sort((obj1, obj2) => {
          if (Number(obj1.experience.substring(0,4).match(/\d+/g).map(Number)) > Number(obj2.experience.substring(0,4).match(/\d+/g).map(Number))) {
              return 1;
          }
      
          if (Number(obj1.experience.substring(0,4).match(/\d+/g).map(Number)) < Number(obj2.experience.substring(0,4).match(/\d+/g).map(Number))) {
              return -1;
          }
      
          return 0;
      });
      }else if(this.check){
        var sortedArray: [] = this.fileListStrength.sort((obj1, obj2) => {
          if (Number(obj1.experience.substring(0,4).match(/\d+/g).map(Number)) > Number(obj2.experience.substring(0,4).match(/\d+/g).map(Number))) {
              return -1;
          }
      
          if (Number(obj1.experience.substring(0,4).match(/\d+/g).map(Number)) < Number(obj2.experience.substring(0,4).match(/\d+/g).map(Number))) {
              return 1;
          }
      
          return 0;
      });
      }
    }else if(x=='strength'){
      if(!this.check){
        var sortedArray: [] = this.fileListStrength.sort((obj1, obj2) => {
          if (obj1.strength > obj2.strength) {
              return 1;
          }
      
          if (obj1.strength < obj2.strength) {
              return -1;
          }
      
          return 0;
      });
      }else if(this.check){
        var sortedArray: [] = this.fileListStrength.sort((obj1, obj2) => {
          if (obj1.strength > obj2.strength) {
              return -1;
          }
      
          if (obj1.strength < obj2.strength) {
              return 1;
          }
      
          return 0;
      });
      }  
    }
    this.fileListStrength = sortedArray;
  }
  filter(x){
    let filtedArray = [];
    // this.fileListSave = this.fileListStrength;
    for(let i=0;i<this.fileListSave.length;i++){
      let exp = Number(this.fileListSave[i].experience.substring(0,4).match(/\d+/g).map(Number))
      if(x==2){
        if(exp>=0 && exp<2){
          filtedArray.push(this.fileListSave[i])
        }
      }else if(x==5){
        if(exp>=2 && exp<5){
          filtedArray.push(this.fileListSave[i])
        }
      }else if(x==6){
        if(exp>=5){
          filtedArray.push(this.fileListSave[i])
        }
      }else{
          filtedArray.push(this.fileListSave[i])
      }
    }
    this.fileListStrength = filtedArray;
  }
}
