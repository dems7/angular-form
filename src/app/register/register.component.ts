import { Component, OnInit } from '@angular/core';
import { 
  AbstractControl, 
  FormBuilder, 
  FormControl, 
  FormGroup, 
  NgForm, 
  Validators, 
  FormArray } 
  from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { User } from './user';

/*
function ratingRangeValidator(c:AbstractControl) : {[key : string] : boolean} | null {
  if (!!c.value && (isNaN(c.value) || c.value < 1 || c.value > 5 )) {
    return {'rangeError':true};
  }
  return null;
}*/

function ratingRangeValidator(min: number, max: number) {
  return (c:AbstractControl) : {[key : string] : boolean} | null => {
    if (!!c.value && (isNaN(c.value) || c.value < min || c.value > max )) {
      return {'rangeError':true};
    }
    return null;
  }
}

function emailMatcher(c : AbstractControl) : {[key: string] : boolean} | null {
  const emailControl = c.get('email');
  const confirmEmailControl = c.get('confirmEmail');

  if (emailControl?.pristine || confirmEmailControl?.pristine) {
    return null;
  }

  if (emailControl?.value===confirmEmailControl?.value) {
    return null;
  }else{
    return {'match':true}
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public registerForm! : FormGroup;

  //public user : User = new User();

  public errorMsg! : string;
   
  private validationErrorsMessages :any = {
    required : 'Entrez votre E-mail',
    email    : 'E-mail invalide'
  };


  constructor(private fb : FormBuilder){}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      lastName    : ['',[Validators.required, Validators.minLength(2)]],
      firstName   : ['',[Validators.required, Validators.maxLength(20)]],
      emailGroup: this.fb.group({
        email       : ['',[Validators.required, Validators.email]],
        confirmEmail: ['',[Validators.required]],
      }, {validators : emailMatcher}),
      phone       : '',
      notification: 'email',
      rating      : [null, ratingRangeValidator(0, 5)],
      sendCatalog : true,
      addresses   : this.fb.array([this.createAddressGroup()]),
    });

    this.registerForm.get('notification')?.valueChanges.subscribe(value => {
      this.setNotificationMethod(value);
    });

    const emailControl = this.registerForm.get('emailGroup.email');
    const confirmEmailControl = this.registerForm.get('emailGroup.confirmEmail');
    //ecouter les changement sur ce control
    emailControl?.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(value => {
      console.log(value);
      this.setMessage(emailControl);
    })
    confirmEmailControl?.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(value => {
      console.log(value);
    })
  }

  private createAddressGroup() : FormGroup{
    return this.fb.group({
      addressType : ['home'],
      street1     : [''],
      street2     : [''],
      city        : [''],
      state       : [''],
      zip         : ['']
    });
  }

  saveData() {
    console.log(this.registerForm)
    console.log('valeurs: ', JSON.stringify(this.registerForm.value))
    console.log("only god")
  }

  setNotificationMethod(choice: string):void{
    const phoneControl = this.registerForm.get('phone');
    if (choice=='text') {
      phoneControl?.setValidators(Validators.required)
    } else {
      phoneControl?.clearValidators();
    }
    phoneControl?.updateValueAndValidity();
  }

  private setMessage(val: AbstractControl) : void{
    this.errorMsg = '';
    if ((val.touched || val.dirty) && val.errors) {
      //les erreurs viennent sous forme de clée et valeur
      console.log(Object.keys(val.errors));
      this.errorMsg = Object.keys(val.errors).map(
        //modifier la valeur qui va etre retourner pour chaque clée
        key => this.validationErrorsMessages[key]
      ).join('');
    }

    //console.log(this.errorMsg)
  }

  public get  addressList() : FormArray{
    return this.registerForm.get('addresses') as FormArray;
  }

  public addAddressList(): void {
    this.addressList.push(this.createAddressGroup);
  }
 
  defaultData() : void{
    this.registerForm.patchValue({
      lastName : 'Doe',
      firstName : 'John'
    })
  }

  /*saveData(registerForm : NgForm) {
    console.log(registerForm.form)
    console.log('valeurs: ', JSON.stringify(registerForm.value))
    console.log("fatou ndiaye my baby")
  }*/
}


