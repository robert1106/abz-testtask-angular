import { Component, OnInit, DoCheck } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ModalComponent } from "./modal/modal.component";
import { BurgerMenuComponent } from "./burger-menu/burger-menu.component";

import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { ToastrService } from "ngx-toastr";

interface Data {
  count: number,
  links: any,
  page: number,
  success: boolean,
  total_pages: number,
  total_users: number,
  users: any,
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, DoCheck{
  form: FormGroup;
  modalRef: MdbModalRef<ModalComponent> | null = null;

  constructor(
    private http: HttpClient,
    private modalService: MdbModalService,
    private toastr: ToastrService,
  ) {
    this.form = new FormGroup({
      name: new FormControl(null,
        [Validators.required, Validators.min(2), Validators.max(60)]),
      email: new FormControl(null,
        [Validators.required, Validators.min(2), Validators.max(100),
        Validators.pattern('^(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])$')]),
      phone: new FormControl(null,
        [Validators.required, Validators.pattern('^[\\+]{0,1}380([0-9]{9})$')]),
      position_id: new FormControl('1',
        [Validators.required]),
    })
  }

  users: any = [];
  positions: any = [];
  startCards = 0;
  numberCards = 0;
  disabledBtn = false;
  disabledCreatedUserBtn = true;
  width = window.innerWidth;
  token: any;
  photo: any;
  photoName: string = 'Upload your photo';
  menuList: any = [
    {content: 'About me', href: 'header'},
    {content: 'Relationships', href: 'register'},
    {content: 'Requirements', href: 'register'},
    {content: 'Users', href: 'users'},
    {content: 'Sign Up', href: 'register'},
  ];
  activeMenuItem: string = this.menuList[0].content;

  data: Data = {
    count: 0,
    links: {},
    page: 0,
    success: false,
    total_pages: 0,
    total_users: 0,
    users: [],
  };

  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get phone() { return this.form.get('phone'); }


  ngOnInit(): void {
    this.showNumCards();
    this.http.get('https://frontend-test-assignment-api.abz.agency/api/v1/positions')
      .subscribe((res: any) => {
        this.positions = res.positions;
      })
    this.http.get('https://frontend-test-assignment-api.abz.agency/api/v1/token')
      .subscribe((res: any) => {
        this.token = res.token;
      })
  }

  ngDoCheck(): void {
    if (this.numberCards === this.data.total_users) {
      this.disabledBtn = true;
    }
    if(this.form.valid && this.photo) {
      this.disabledCreatedUserBtn = false;
    } else {
      this.disabledCreatedUserBtn = true;
    }
    if(this.photo) {
      this.photoName = this.photo.name;
    }
  }

  activeClassMenuItem(menuItem: string){
    if(this.activeMenuItem === menuItem){
      return 'active';
    }
    return '';
  }

  reload() {
    this.http.get('https://frontend-test-assignment-api.abz.agency/api/v1/users?page=1&count='+this.numberCards)
      .subscribe((res: any) => {
        this.data = res;
        this.users = res.users;
      })
  }

  createdUser() {
    this.showNumCards();
    const uploadData = new FormData();
    uploadData.append('photo', this.photo);
    for ( let key in this.form.getRawValue() ) {
      uploadData.append(key, this.form.getRawValue()[key]);
    }
    this.http.post('https://frontend-test-assignment-api.abz.agency/api/v1/users', uploadData,
      { headers: {"Token": this.token}})
      .subscribe((res: any) => {
          this.reload();
          this.openModal();
        },
          error => {
            console.log(1);
            if(error.error.message){
              this.toastr.error(error.error.message);
            }
            if (error.error.fails) {
              for (let key in error.error.fails) {
                this.form.controls[key].setErrors({serverError: error.error.fails[key][0] || 'can\'t be blank'});
              }
            }
          })
  }

  showNumCards() {
    if(this.width < 615) {
      this.startCards = 3;
    } else if(this.width < 934) {
      this.startCards = 6;
    } else if(this.width >= 934) {
      this.startCards = 9;
    }
    this.numberCards = this.startCards;
    this.reload();
  }

  clickShowMore() {
    if(this.data.total_users > this.numberCards && (this.numberCards+this.startCards) < this.data.total_users) {
      this.numberCards += this.startCards;
    } else {
      this.numberCards = this.data.total_users;
    }
    this.reload();
  }

  errorImgCard(id: number) {
    this.users.forEach((user: any) => {
      if(user.id === id) {
        user.photo = '../assets/image/card-img.svg';
      }
    })
  }

  onFileChanged(event: any) {
    this.photo = event.target.files[0];
    console.log(this.photo);
  }

  openBurgerMenu() {
    this.modalRef = this.modalService.open(BurgerMenuComponent)
  }

  openModal() {
    this.modalRef = this.modalService.open(ModalComponent)
  }
}
