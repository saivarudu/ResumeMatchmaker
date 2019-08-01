import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { FileSelectDirective, FileUploader} from 'ng2-file-upload';
import { FileService } from './../file.service';
import { FormGroup, FormControl } from '@angular/forms';
import { AppService } from '../app.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { saveAs } from 'file-saver';
const uri = 'http://localhost:3000/upload';
@Component({
  selector: 'app-root',
  templateUrl: './hr.component.html',
  styleUrls: ['./hr.component.scss'],
  providers:[FileService]
})
export class HRComponent implements OnInit {
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  optionsModel: number[];
  myOptions:any = [];
  uploader:FileUploader = new FileUploader({
    url:uri
  });
  fileList: any;
  userList: any;
  filesNotPresent: boolean = true;
  modalRef: BsModalRef;
  attachmentList:any = [];
  formdata: any;
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
    this.appService.getUsers().subscribe((success : any)=>{
      this.userList = success.data;
      for(let i=0;i<this.userList.length;i++){
        if(this.userList[i].manager==1){
          this.myOptions.push(this.userList[i]);
        }
      }
    }, (err)=>{
      alert('Unable to fetch data from the backend db')
    }
    );
    this.formdata = new FormGroup({
      // setusername: new FormControl(),
      // setpassword: new FormControl(),
      // setconfirmpassword: new FormControl(),
      // dropdownTab: new FormControl(),
   });
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
    this.dropdownList = this.myOptions;
    this.selectedItems = [
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'username',
      textField: 'username',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'gray modal-lg' }));
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
  set(x: any){
      if(this.selectedItems.length!==0){
        this.appService.updatePermissions(x,this.selectedItems).subscribe((success : any)=>{
          this.myOptions = [];
          this.modalRef.hide();
          this.ngOnInit();
        }, (error)=>{
          alert('Error in updating the manager permissions')
        }
        );
      } else {
        alert('Please select the managers to update the permissions');
      }
  }
  onItemSelect(item: any) {
  }
  onSelectAll(items: any) {
  }
}
