import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile-main',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-main.html',
  styleUrl: './profile-main.scss',
})
export class ProfileMain {
  private fb = inject(FormBuilder);
  
  profileForm: FormGroup = this.fb.group({
    pictureUrl: ['', [Validators.minLength(10), Validators.maxLength(500)]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['',[Validators.required, Validators.minLength(2)]],
    dob: ['', []],
    phoneNumber: ['', [Validators.minLength(7), Validators.maxLength(15)]],
    address: ['', [Validators.minLength(5), Validators.maxLength(200)]],
  });
  get pictureUrl() {return this.profileForm.get('pictureUrl')}
  get firstName() {return this.profileForm.get('firstName')}
  get lastName() {return this.profileForm.get('lastName')}
  get dob() {return this.profileForm.get('dob')}
  get phoneNumber() {return this.profileForm.get('phoneNumber')}
  get address() {return this.profileForm.get('address')}

  onSubmit(){

  }
  discardChanges(){
    
  }
} 
