import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CategoriesService} from "../../shared/services/categories.service";
import {switchMap} from "rxjs/operators";
import {of} from "rxjs"
import {MaterialService} from "../../shared/classes/material.service";
import {Category} from "../../shared/services/interfaces";
import {response} from "express";
//import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-catefories-form',
  templateUrl: './catefories-form.component.html',
  styleUrls: ['./catefories-form.component.css']
})
export class CateforiesFormComponent implements OnInit{

  @ViewChild('input') inputRef: ElementRef
  form: FormGroup
  image: File
  imagePreview = ''
  isNew = true
  category: Category

  constructor(private route: ActivatedRoute,
              private categoriesService: CategoriesService,
              private router: Router) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required)
    })

    this.form.disable()

    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    this.route.params
      .pipe(
        switchMap(
          (params: Params) => {
            if (params['id']) {
              this.isNew = false
              return this.categoriesService.getById(params['id'])
            }

            return of(null)
          }
        )
      )
      .subscribe(
        // @ts-ignore
        (category:Category) => {
          if (category) {
            this.category = category
            this.form.patchValue({
              name: category.name
            })
            // @ts-ignore
            this.imagePreview = category.imageSrc
            MaterialService.updateTextInputs()
          }

          this.form.enable()
        },
        error => MaterialService.toast(error.error.message)
      )
  }

  triggerClick() {
    this.inputRef.nativeElement.click()
  }

  deleteCategory() {
    const decision = window.confirm(`Вы уверены, что хотите удалить категорию "${this.category.name}"`)

    if(decision) {
      this.categoriesService.delete(this.category._id)
        .subscribe(
          response => MaterialService.toast(response.message),
          error => MaterialService.toast(error.error.message),
          () => this.router.navigate(['/categories'])
        )
    }
  }

  onFileUpload(event: any) {
    const file = event.target.files[0]
    this.image = file

    const reader = new FileReader()

    reader.onload = () => {
      // @ts-ignore
      this.imagePreview = reader.result
    }

    reader.readAsDataURL(file)
  }

  onSubmit() {
    let obs$
    this.form.disable()

    if (this.isNew) {
      //create
      obs$ = this.categoriesService.create(this.form.value.name, this.image)
    } else {
      //update
      // @ts-ignore
      obs$ = this.categoriesService.update(this.category._id,this.form.value.name, this.image)
    }

    obs$.subscribe(
      category => {
        this.category = category
        MaterialService.toast('Изменения сохранены.')
        this.form.enable()
      },
      error => {
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    )
  }

}
