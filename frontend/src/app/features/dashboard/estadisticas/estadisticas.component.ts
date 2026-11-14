import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { EstadisticasService } from '../../../core/services/estadisticas.service';
import { ModalService } from '../../../compartido/services/modal.service';
import { ButtonComponent } from '../../../compartido/components/button/button.component';
import { SpinnerComponent } from '../../../compartido/components/spinner/spinner.component';
import { ResaltarDirective } from '../../../compartido/directivas/resaltar.directive';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BaseChartDirective,
    ButtonComponent,
    SpinnerComponent,
    ResaltarDirective
  ],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export class EstadisticasComponent implements OnInit {
  private estadisticasService = inject(EstadisticasService);
  private servicioModal = inject(ModalService);
  private fb = inject(FormBuilder);

  readonly cargando = signal<boolean>(true);
  readonly totalPublicaciones = signal<number>(0);
  readonly totalComentariosDia = signal<number>(0);
  readonly totalComentariosPub = signal<number>(0);

  // Formulario del Lapso de Fechas
  formFiltro = this.fb.group({
    desde: ['', Validators.required],
    hasta: ['', Validators.required]
  });

  // Paleta de Colores Manga
  readonly coloresManga = {
    rojo: '#D90429',
    amarillo: '#FFC409',
    tinta: '#111111',
    screentone: '#888888',
    papel: '#FAF7F0',
    papel2: '#EBE5D8'
  };

  // 1. Gráfico de Barras: Publicaciones por Usuario
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#111111', font: { weight: 'bold' } } },
      y: { ticks: { color: '#111111', stepSize: 1 }, beginAtZero: true }
    }
  };

  // 2. Gráfico de Líneas: Comentarios por Día
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#111111', font: { weight: 'bold' } } },
      y: { ticks: { color: '#111111', stepSize: 1 }, beginAtZero: true }
    }
  };

  // 3. Gráfico de Dona: Comentarios por Publicación
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#111111', font: { weight: 'bold' } } }
    }
  };

  ngOnInit(): void {
    this.inicializarFechasDefecto();
    this.cargarEstadisticas();
  }

  /**
   * por defecto los últimos 30 días usando fechas locales YYYY-MM-DD
   */
  private inicializarFechasDefecto(): void {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    const formatFecha = (d: Date): string => {
      const anio = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const dia = String(d.getDate()).padStart(2, '0');
      return `${anio}-${mes}-${dia}`;
    };

    this.formFiltro.patchValue({
      desde: formatFecha(hace30Dias),
      hasta: formatFecha(hoy)
    });
  }

  aplicarFiltro(): void {
    if (this.formFiltro.invalid) return;

    const { desde, hasta } = this.formFiltro.value;
    if (!desde || !hasta) return;

    const dDesde = new Date(desde);
    const dHasta = new Date(hasta);

    // Valida en el front desde <= hasta y max 366 días
    if (dDesde > dHasta) {
      this.servicioModal.abrir({
        titulo: '¡RANGO INVÁLIDO!',
        mensaje: 'La fecha "Desde" no puede ser posterior a la fecha "Hasta".',
        tipo: 'error',
        onomatopeya: '¡NANI?!'
      });
      return;
    }

    const difMs = dHasta.getTime() - dDesde.getTime();
    const difDias = difMs / (1000 * 60 * 60 * 24);

    if (difDias > 366) {
      this.servicioModal.abrir({
        titulo: '¡LAPSO MUY LARGO!',
        mensaje: 'El rango de fechas no puede superar los 366 días (1 año).',
        tipo: 'error',
        onomatopeya: '¡WAIT!'
      });
      return;
    }

    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    const { desde, hasta } = this.formFiltro.value;
    if (!desde || !hasta) return;

    this.cargando.set(true);

    //Peticiones paralelas tolerantes a fallos parciales
    forkJoin({
      pubUsuario: this.estadisticasService.publicacionesPorUsuario(desde, hasta).pipe(catchError(() => of(null))),
      comDia: this.estadisticasService.comentariosPorDia(desde, hasta).pipe(catchError(() => of(null))),
      comPub: this.estadisticasService.comentariosPorPublicacion(desde, hasta, 5).pipe(catchError(() => of(null)))
    }).subscribe(({ pubUsuario, comDia, comPub }) => {
      this.cargando.set(false);

      // 1. Barras: Publicaciones por Usuario
      if (pubUsuario && pubUsuario.items.length) {
        this.totalPublicaciones.set(pubUsuario.total);
        this.barChartData = {
          labels: pubUsuario.items.map(i => `@${i.nombreUsuario}`),
          datasets: [{
            data: pubUsuario.items.map(i => i.cantidad),
            backgroundColor: this.coloresManga.rojo,
            borderColor: this.coloresManga.tinta,
            borderWidth: 2
          }]
        };
      } else {
        this.totalPublicaciones.set(0);
        this.barChartData = { labels: [], datasets: [] };
      }

      // 2. Líneas: Comentarios por Día
      if (comDia && comDia.items.length) {
        this.totalComentariosDia.set(comDia.total);
        this.lineChartData = {
          labels: comDia.items.map(i => i.fecha),
          datasets: [{
            data: comDia.items.map(i => i.cantidad),
            borderColor: this.coloresManga.tinta,
            backgroundColor: 'rgba(217, 4, 41, 0.2)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: this.coloresManga.amarillo,
            pointBorderColor: this.coloresManga.tinta,
            pointRadius: 5
          }]
        };
      } else {
        this.totalComentariosDia.set(0);
        this.lineChartData = { labels: [], datasets: [] };
      }

      // 3. Dona: Comentarios por Publicación
      if (comPub && comPub.items.length) {
        this.totalComentariosPub.set(comPub.total);
        this.doughnutChartData = {
          labels: comPub.items.map(i => i.titulo.length > 20 ? i.titulo.substring(0, 20) + '...' : i.titulo),
          datasets: [{
            data: comPub.items.map(i => i.cantidad),
            backgroundColor: [this.coloresManga.rojo, this.coloresManga.amarillo, '#3A86EF', '#8338EC', '#FF006E'],
            borderColor: this.coloresManga.tinta,
            borderWidth: 2
          }]
        };
      } else {
        this.totalComentariosPub.set(0);
        this.doughnutChartData = { labels: [], datasets: [] };
      }
    });
  }

  // Gráfico seleccionado para visualizar en grande
  readonly graficoSeleccionado = signal<
    'publicaciones' | 'comentarios-dia' | 'comentarios-publicacion' | null
  >(null);

  abrirGrafico(
    grafico: 'publicaciones' | 'comentarios-dia' | 'comentarios-publicacion'
  ): void {
    this.graficoSeleccionado.set(grafico);
  }

  cerrarGrafico(): void {
    this.graficoSeleccionado.set(null);
  }
}