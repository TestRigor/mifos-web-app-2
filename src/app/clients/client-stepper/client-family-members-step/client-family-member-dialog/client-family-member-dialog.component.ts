/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Client Family Members Dialog
 */
@Component({
  selector: 'mifosx-client-family-member-dialog',
  templateUrl: './client-family-member-dialog.component.html',
  styleUrls: ['./client-family-member-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatCheckbox,
    MatDialogActions,
    MatDialogClose
  ]
})
export class ClientFamilyMemberDialogComponent implements OnInit {
  /** Maximum Due Date allowed. */
  maxDate = new Date();

  /** Add/Edit family member form. */
  familyMemberForm: UntypedFormGroup;

  /**
   * @param {MatDialogRef} dialogRef Client Family Member Dialog Reference
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Dates} dateUtils Date Utils
   * @param {any} data Dialog Data
   * @param {SettingsService} settingsService Setting service
   */
  constructor(
    public dialogRef: MatDialogRef<ClientFamilyMemberDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    private dateUtils: Dates,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createFamilyMemberForm();
    if (this.data.context === 'Edit') {
      this.familyMemberForm.patchValue({
        firstName: this.data.member.firstName,
        middleName: this.data.member.middleName,
        lastName: this.data.member.lastName,
        qualification: this.data.member.qualification,
        age: this.data.member.age,
        isDependent: this.data.member.isDependent,
        relationshipId: this.data.member.relationshipId,
        genderId: this.data.member.genderId,
        professionId: this.data.member.professionId,
        maritalStatusId: this.data.member.maritalStatusId,
        dateOfBirth: this.data.member.dateOfBirth && new Date(this.data.member.dateOfBirth)
      });
    }
  }

  /**
   * Creates Family Member Form
   */
  createFamilyMemberForm() {
    this.familyMemberForm = this.formBuilder.group({
      firstName: [
        '',
        Validators.required
      ],
      middleName: [''],
      lastName: [
        '',
        Validators.required
      ],
      qualification: [''],
      age: [''],
      isDependent: [''],
      relationshipId: [
        '',
        Validators.required
      ],
      genderId: [
        '',
        Validators.required
      ],
      professionId: [''],
      maritalStatusId: [''],
      dateOfBirth: ['']
    });

    // Add custom validation to ensure either age or dateOfBirth is provided
    this.familyMemberForm.setValidators(this.ageOrDateOfBirthValidator);

    // Subscribe to value changes to update validation
    this.familyMemberForm.get('age').valueChanges.subscribe(() => {
      this.familyMemberForm.get('dateOfBirth').updateValueAndValidity();
    });

    this.familyMemberForm.get('dateOfBirth').valueChanges.subscribe(() => {
      this.familyMemberForm.get('age').updateValueAndValidity();
    });
  }

  /**
   * Custom validator to ensure either age or dateOfBirth is provided
   */
  ageOrDateOfBirthValidator = (group: UntypedFormGroup) => {
    const age = group.get('age')?.value;
    const dateOfBirth = group.get('dateOfBirth')?.value;

    if (!age && !dateOfBirth) {
      return { ageOrDateOfBirthRequired: true };
    }

    return null;
  };

  /**
   * Returns Formatted Family Member
   */
  get familyMember() {
    const familyMemberFormData = this.familyMemberForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    if (familyMemberFormData.dateOfBirth instanceof Date) {
      familyMemberFormData.dateOfBirth = this.dateUtils.formatDate(familyMemberFormData.dateOfBirth, dateFormat);
    }
    const familyMember = {
      ...familyMemberFormData,
      dateFormat,
      locale
    };
    for (const key in familyMember) {
      if (familyMember[key] === '' || familyMember[key] === undefined) {
        delete familyMember[key];
      }
    }
    return familyMember;
  }
}
