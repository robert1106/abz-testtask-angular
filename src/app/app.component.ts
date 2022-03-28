import { Component, OnInit, DoCheck } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ModalComponent } from "./modal/modal.component";

import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';

let usersGlob: any = [];

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
  ) {
    this.form = new FormGroup({
      name: new FormControl(null,
        [Validators.required, Validators.min(2), Validators.max(60)]),
      email: new FormControl(null,
        [Validators.required, Validators.min(2), Validators.max(100), validationEmail,
        Validators.pattern('^(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])$')]),
      phone: new FormControl(null,
        [Validators.required, Validators.pattern('^[\\+]{0,1}380([0-9]{9})$'), validationPhone]),
      position_id: new FormControl('1',
        [Validators.required]),
    })
  }

  users: any = [];
  positions: any = [];
  startCards = 9;
  numberCards = 0;
  disabledBtn = false;
  disabledCreatedUserBtn = false;
  width = window.innerWidth;
  token: any;
  photo: any;

  data: Data = {
    count: 0,
    links: {},
    page: 0,
    success: false,
    total_pages: 0,
    total_users: 0,
    users: [],
  };

  ngOnInit(): void {
    this.showNumCards();
    this.numberCards= this.startCards;
    this.reload();
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
  }

  reload() {
    this.http.get('https://frontend-test-assignment-api.abz.agency/api/v1/users?page=1&count='+this.numberCards)
      .subscribe((res: any) => {
        this.data = res;
        this.users = res.users;
        this.http.get('https://frontend-test-assignment-api.abz.agency/api/v1/users?page=1&count='+this.data.total_users)
          .subscribe((res: any) => {
            usersGlob = res.users;
          })
      })

  }

  createdUser() {
    if(this.form.valid) {
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
              for (let key in error.error.fails) {
                this.form.get(key)!.setErrors({
                    serverError: error.error.fails[key] || 'can\'t be blank'
                  })
              }
            })
    }
  }

  showNumCards() {
    if(this.width < 615) {
      this.startCards = 3;
    } else if(this.width < 934) {
      this.startCards = 6;
    }
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
  }

  openModal() {
    this.modalRef = this.modalService.open(ModalComponent, {
      modalClass: 'modal-dialog-centered'
    })
  }
}

function validationEmail(control: FormControl) {
  const email = control.value;
  const findEmail = usersGlob.find((user: any) => user.email == email)
  if (findEmail) {
    console.log(email, 'email уже существует')
    return {
      emailDomain: {
        parsedDomain: email
      }
    }
  }
  return null;
}

function validationPhone(control: FormControl) {
  const phone = control.value;
  const findPhone = usersGlob.find((user: any) => user.phone == phone)
  if (findPhone) {
    console.log(phone, 'phone уже существует')
    return {
      phoneDomain: {
        parsedDomain: phone
      }
    }
  }
  return null;
}
