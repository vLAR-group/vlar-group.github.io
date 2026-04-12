\subsection{Physical Properties Estimation}

Estimating the physical properties of objects from visual frames is particularly challenging due to complex dynamics arising from internal forces that vary with object deformation, non-uniform velocity distributions, and spatially heterogeneous external forces. These factors contribute to highly intricate visual appearances. Existing methods are often evaluated on relatively small datasets with limited object diversity, constraining progress in the field. Our collection, encompassing a wide range of objects, including deformable, granular, and liquid types together with complex backgrounds, provides an ideal platform for testing the capabilities of current and future models.

In this section, we evaluate two representative and scene-specific methods \textbf{PAC-NeRF} \cite{Li2023} and \textbf{GIC} \cite{Cai2024} on a randomly selected subset of 20 scenes in our test set, called \textit{test-tiny}. The scenes are distributed across five representative material categories (4 scenes per category):

\begin{figure*}[t]
\centering
\includegraphics[width=1\linewidth]{figs/motion_transfer_cam2.pdf}
\vskip -0.1in
%\caption{Qualitative results of motion transfer. Generated frames retain visual realism but fail to transfer complex physical motions.}
\caption{Qualitative motion transfer results from GoWithTheFlow and MotionPro. Generated frames retain visual realism but fail to transfer complex physical motions (\eg{}, moving cars, falling ball).}
\label{fig:motion_transfer_res}
\vspace{-0.4cm}
%\vskip 0.4in
\end{figure*}



\begin{table}[tbp] \tabcolsep=0.12cm \vspace{-0.05cm}
\centering
\caption{Quantitative results of physical parameters estimation for five types of materials on \nickname{}. }\vspace{-0.3cm}
\label{tab:phys_prop_esti}
\resizebox{0.48\textwidth}{!}{%
\begin{tabular}{l|ccccc}
\toprule
\rowcolor{headergray}   & \multicolumn{5}{c}{Elastic Solids} \\
   & $\log_{10}(E)$ & $\nu$ & & & $\boldsymbol{v}$ \\ \hdashline
PAC-NeRF \cite{Li2023} & 117.18$\pm$68.44 & 14.26$\pm$7.94 & & & 4.04$\pm$1.11  \\
GIC \cite{Cai2024}    & 49.76$\pm$8.78 & 16.35$\pm$1.36 & & & 3.32$\pm$1.34  \\ \hline

\rowcolor{headergray}   & \multicolumn{5}{c}{Plasticine} \\
   & $\log_{10}(E)$ & $\nu$ & $\log_{10}(\tau_Y)$ & & $\boldsymbol{v}$ \\ \hdashline
PAC-NeRF \cite{Li2023} & 68.38$\pm$44.14 & 15.79$\pm$11.07 & 25.51$\pm$18.34 & & 3.25 $\pm$0.23  \\
GIC \cite{Cai2024}    & 178.36$\pm$46.68 & 42.72$\pm$25.65 & 17.11$\pm$19.38 & & 3.39$\pm$0.87  \\ \hline
\rowcolor{headergray}   & \multicolumn{5}{c}{Newtonian Fluids} \\
   & $\log_{10}(\mu)$ & $\log_{10}(\kappa)$ &  &  & $\boldsymbol{v}$ \\ \hdashline
PAC-NeRF \cite{Li2023} & 42.64$\pm$29.88 & 287.56$\pm$194.98 & & & 3.11$\pm$0.31  \\
GIC \cite{Cai2024}  & 8.78$\pm$9.64 & 70.07$\pm$53.44 &  & & 3.28$\pm$0.85  \\ \hline

\rowcolor{headergray}   & \multicolumn{5}{c}{Non-Newtonian Fluids} \\
   & $\log_{10}(\mu)$ & $\log_{10}(\kappa)$ & $\log_{10}(\tau_Y)$  & $\log_{10}(\eta)$ & $\boldsymbol{v}$ \\ \hdashline
PAC-NeRF \cite{Li2023} & 
309.42$\pm$235.61 & 552.89$\pm$105.24 &
339.20$\pm$145.99 &  65.60$\pm$71.73 & 2.95$\pm$0.30  \\
GIC \cite{Cai2024} & 
124.26$\pm$98.35 & 181.87$\pm$113.70 &
28.78$\pm$13.89 &  24.97$\pm$15.53 & 3.73$\pm$0.62  \\ \hline

\rowcolor{headergray}   & \multicolumn{5}{c}{Granular Substances} \\
   & $\theta_{fric}$ &  & &  & $\boldsymbol{v}$ \\ \hdashline
PAC-NeRF \cite{Li2023} & 16.87$\pm$27.36 & & & & 3.29$\pm$0.21  \\
GIC \cite{Cai2024}  & 18.85$\pm$16.67 & & & & 3.57$\pm$0.95  \\
\bottomrule
\end{tabular}
}\vspace{-0.3cm}
\end{table}

% \begin{table}[htb] \tabcolsep=0.3cm  \vspace{-0.3cm}
% \centering
% \caption{Quantitative results of resimulation based on estimated physical properties.}\vspace{-0.25cm}
% \label{tab:phys_prop_esti_resim}
% \resizebox{0.46\textwidth}{!}{
% \begin{tabular}{lccccc}
% \toprule[1.0pt]
%     & PSNR $\uparrow$ & SSIM $\uparrow$ & LPIPI$\downarrow$  & DyTra $\downarrow$ & PMF $\uparrow$  \\ \toprule[1.0pt]
% PAC-NeRF \cite{Li2023} & 0.0  & 0.0 & 0.0  & 0.0 & 0.0  \\
% GIC \cite{Cai2024} & 0.0  & 0.0 & 0.0  & 0.0 & 0.0   \\ \hline
% \toprule[1.0pt]
% \end{tabular}
% }\vspace{-0.4cm}
% \end{table}

\begin{itemize}[leftmargin=*] %\vspace{-0.2cm}
\setlength{\itemsep}{1pt}
\setlength{\parsep}{1pt}
\setlength{\parskip}{1pt}
    \item \textit{Elastic Solids}: whose dynamics are governed by \textbf{Young’s modulus} $E$ and \textbf{Poisson’s ratio} $\nu$.
    \item \textit{Plasticine}: whose dynamics are governed by \textbf{Young’s modulus} $E$, \textbf{Poisson’s ratio} $\nu$, and \textbf{yield stress} $\tau_Y$.
    \item \textit{Newtonian Fluids}: whose dynamics are governed by \textbf{fluid viscosity} $\mu$ and \textbf{bulk modulus} $\kappa$.
    \item \textit{Non-Newtonian Fluids}: whose dynamics are governed by \textbf{yield stress} $\tau_Y$, \textbf{shear modulus} $\mu$, \textbf{plasticity viscosity} $\eta$, and \textbf{bulk modulus} $\kappa$.
    \item \textit{Granular Substances}: whose dynamics are governed by \textbf{friction angle} $\theta_{fric}$. 
\end{itemize}

\begin{table}[htb] \tabcolsep=0.3cm  \vspace{-0.3cm}
\centering
\caption{Quantitative results of resimulation based on estimated physical properties.}\vspace{-0.25cm}
\label{tab:phys_prop_esti_resim}
\resizebox{0.48\textwidth}{!}{
\begin{tabular}{lcccc}
\toprule[1.0pt]
\rowcolor{headergray} & PMF $\uparrow$    & PSNR $\uparrow$ & SSIM $\uparrow$ & LPIPS$\downarrow$    \\ \toprule[1.0pt]
PAC-NeRF \cite{Li2023} & 5.617 & 24.12  & 0.942 & 0.086    \\
GIC \cite{Cai2024} & \textbf{5.938} & \textbf{26.90}  & \textbf{0.950} & \textbf{0.074}     \\ \hline
\toprule[1.0pt]
\end{tabular}
}\vspace{-0.4cm}
\end{table}

We additionally estimate the initial velocity $\boldsymbol{v}$ of the dynamic object in each test scene. Table \ref{tab:phys_prop_esti} compares the accuracy of estimated physical properties against the ground truth provided in \nickname{}. To further validate the learned properties, we resimulate 3D scenes under novel initial conditions (\eg{}, modified object positions) and quantitatively compare rendered videos against reference videos generated using ground-truth physics under identical novel conditions in Table \ref{tab:phys_prop_esti_resim}. Figure \ref{fig:phys_prop_res} shows the qualitative results of resimulation. 
We can see that, while both models infer physically plausible properties, they fall short of accuracy in scenes with complex objects and backgrounds featured by our dataset. This demonstrates how our dataset's challenging cases provide critical benchmarks for revealing limitations in current physical reasoning capabilities. More details of experiment settings are provided in Appendix \ref{app:phys_esti_exp}.